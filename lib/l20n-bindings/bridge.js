'use strict';

import { fetchResource, Env, FSI, PDI, pseudo } from 'babel-loader!exports-loader?FSI=FSI="",PDI=PDI="",pseudo=pseudo!l20n/dist/compat/web/l20n-common';
import { JsonParser } from './jsonParser';

var _envParse = Env.prototype._parse;
var _envGetResource = Env.prototype._getResource;

Env.prototype._parse = function _parse(syntax, lang, data) {
  var self = this;
  if(syntax === 'json'){
    var emit = function (type, err) {
      return self.emit(type, function(lang, err) {
        err.lang = lang;
        return err;
      });
    };
    self.parser = JsonParser;
    return JsonParser.parse(emit, data);
  }else{
    self.parser = _envParse;
    return _envParse.call(self, syntax, lang, data);
  }
};

Env.prototype._getResource = function _getResource(lang, res){
  var self = this;
  var syntax, entries;
  if(res === 'staticResource'){
    entries = window.navigator.languageMessages && window.navigator.languageMessages[lang.code] || {};
    syntax = 'json';
  }else if(res.substr(res.lastIndexOf('.') + 1) === 'json'){
    syntax = 'json';
  }

  if(syntax === 'json'){
    var cache = this._resCache;
    var id = res + lang.code + lang.src;

    if (cache.has(id)) {
      return cache.get(id);
    }

    var syntax = 'json';

    var saveEntries = function (data) {
      var _entries = self._parse(syntax, lang, data);
      cache.set(id, self._create(lang, _entries));
    };

    var recover = function (err) {
      err.lang = lang;
      self.emit('fetcherror', err);
      cache.set(id, err);
    };
    if(entries){
      var resource = Promise.resolve(entries).then(saveEntries, recover);
    }else{
      var langToFetch = lang.src === 'pseudo' ? { code: this.defaultLang, src: 'app' } : lang;
      var resource = this.fetchResource(res, langToFetch).then(saveEntries, recover);
    }

    cache.set(id, resource);

    return resource;
  }else{
    return _envGetResource.call(this, lang, res);
  }
}

function broadcast(type, data) {
  Array.from(this.ctxs.keys()).forEach(
    client => {
      return client.emit(type, data)
    });
}

export { pseudo, broadcast, fetchResource , Env };
