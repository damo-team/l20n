var MAX_PLACEABLES = 100;
var ATTRIBUTE_SEPARATOR = ':';

var JsonParser = {
  patterns: null,
  entryIds: null,
  emit: null,

  init: function () {
    this.patterns = {
      comment: /^\s*#|^\s*$/,
      entity: /^([^=\s]+)\s*=\s*(.*)$/,
      multiline: /[^\\]\\$/,
      index: /\{\[\s*(\w+)(?:\(([^\)]*)\))?\s*\]\}/i,
      unicode: /\\u([0-9a-fA-F]{1,4})/g,
      entries: /[^\r\n]+/g,
      controlChars: /\\([\\\n\r\t\b\f\{\}\"\'])/g,
      placeables: /\{\{\s*([^\s]*?)\s*\}\}/
    };
  },
  
  parse: function (emit, JsonData) {
    if (!this.patterns) {
      this.init();
      this.JsonData = JsonData;
    }
    this.emit = emit;

    var entries = {};
    
    for(var k in JsonData){
      this.parseEntity(k, JsonData[k], entries);
    }
    return entries;
  },
  
  parseEntityNS: function(id){
    var entries = {};
    var JsonData = this.JsonData;
    for(var k in JsonData){
      if(k.substr(0, id.length + 1) === id + '.' || k === id){
        this.parseEntity(k, JsonData[k], entries);
      }
    }
    return entries;
  },

  parseEntity: function (id, value, entries) {
    var name, key;

    var pos = id.indexOf('[');
    if (pos !== -1) {
      name = id.substr(0, pos);
      key = id.substring(pos + 1, id.length - 1);
    } else {
      name = id;
      key = null;
    }

    var nameElements = name.split(ATTRIBUTE_SEPARATOR);

    if (nameElements.length > 2) {
      throw this.error('Error in ID: "' + name + '".' + ' Nested attributes are not supported.');
    }

    var attr;
    if (nameElements.length > 1) {
      name = nameElements[0];
      attr = nameElements[1];

      if (attr[0] === '$') {
        throw this.error('Attribute can\'t start with "$"');
      }
    } else {
      attr = null;
    }

    this.setEntityValue(name, attr, key, this.unescapeString(value), entries);
  },

  setEntityValue: function (id, attr, key, rawValue, entries) {
    var value = rawValue.indexOf('{{') > -1 ? this.parseString(rawValue) : rawValue;

    var isSimpleValue = typeof value === 'string';
    var root = entries;

    var isSimpleNode = typeof entries[id] === 'string';

    if (!entries[id] && (attr || key || !isSimpleValue)) {
      entries[id] = Object.create(null);
      isSimpleNode = false;
    }

    if (attr) {
      if (isSimpleNode) {
        var val = entries[id];
        entries[id] = Object.create(null);
        entries[id].value = val;
      }
      if (!entries[id].attrs) {
        entries[id].attrs = Object.create(null);
      }
      if (!entries[id].attrs && !isSimpleValue) {
        entries[id].attrs[attr] = Object.create(null);
      }
      root = entries[id].attrs;
      id = attr;
    }

    if (key) {
      isSimpleNode = false;
      if (typeof root[id] === 'string') {
        var val = root[id];
        root[id] = Object.create(null);
        root[id].index = this.parseIndex(val);
        root[id].value = Object.create(null);
      }
      root = root[id].value;
      id = key;
      isSimpleValue = true;
    }

    if (isSimpleValue && (!entries[id] || isSimpleNode)) {
      if (id in root) {
        throw this.error();
      }
      root[id] = value;
    } else {
      if (!root[id]) {
        root[id] = Object.create(null);
      }
      root[id].value = value;
    }
  },

  parseString: function (str) {
    var chunks = str.split(this.patterns.placeables);
    var complexStr = [];

    var len = chunks.length;
    var placeablesCount = (len - 1) / 2;

    if (placeablesCount >= MAX_PLACEABLES) {
      throw this.error('Too many placeables (' + placeablesCount + ', max allowed is ' + MAX_PLACEABLES + ')');
    }

    for (var i = 0; i < chunks.length; i++) {
      if (chunks[i].length === 0) {
        continue;
      }
      if (i % 2 === 1) {
        complexStr.push({ type: 'idOrVar', name: chunks[i] });
      } else {
        complexStr.push(chunks[i]);
      }
    }
    return complexStr;
  },

  unescapeString: function (str) {
    if (str.lastIndexOf('\\') !== -1) {
      str = str.replace(this.patterns.controlChars, '$1');
    }
    return str.replace(this.patterns.unicode, function (match, token) {
      return String.fromCodePoint(parseInt(token, 16));
    });
  },

  parseIndex: function (str) {
    var match = str.match(this.patterns.index);
    if (!match) {
      throw new L10nError('Malformed index');
    }
    if (match[2]) {
      return [{
        type: 'call',
        expr: {
          type: 'prop',
          expr: {
            type: 'glob',
            name: 'cldr'
          },
          prop: 'plural',
          cmpt: false
        }, args: [{
          type: 'idOrVar',
          name: match[2]
        }]
      }];
    } else {
      return [{ type: 'idOrVar', name: match[1] }];
    }
  },

  error: function (msg) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'parsererror' : arguments[1];

    var err = new L10nError(msg);
    if (this.emit) {
      this.emit(type, err);
    }
    return err;
  }
};

export { JsonParser };