(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["l20n"] = factory();
	else
		root["l20n"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _bridge = __webpack_require__(1);

	var _remote = __webpack_require__(9);

	var _l20nContext = __webpack_require__(12);

	/** -------------------
	* 1. 获取当前语言
	* 2. 初始化Remote
	* 3. 监听浏览器语言切换languagechange, additionallanguageschange
	* 4. 开放L20nProvider, ng1.x应用中自行加入
	* 5. 提供全局对象document.l20n
	----------------------*/

	var requestLanguages = navigator.languages;
	if (window.DEFER_LANGUAGES) {
	  requestLanguages = window.DEFER_LANGUAGES;
	}

	var remote = new _remote.Remote(_bridge.fetchResource, _bridge.broadcast, requestLanguages);

	window.addEventListener('languagechange', remote);
	document.addEventListener('additionallanguageschange', remote);

	document.l20n = (0, _l20nContext.l20nContext)(remote, true);

	exports.default = document.l20n;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Env = exports.fetchResource = exports.broadcast = exports.pseudo = undefined;

	var _l20nCommon = __webpack_require__(7);

	var _jsonParser = __webpack_require__(11);

	var _envParse = _l20nCommon.Env.prototype._parse;
	var _envGetResource = _l20nCommon.Env.prototype._getResource;

	_l20nCommon.Env.prototype._parse = function _parse(syntax, lang, data) {
	  var self = this;
	  if (syntax === 'json') {
	    var emit = function emit(type, err) {
	      return self.emit(type, function (lang, err) {
	        err.lang = lang;
	        return err;
	      });
	    };
	    self.parser = _jsonParser.JsonParser;
	    return _jsonParser.JsonParser.parse(emit, data);
	  } else {
	    self.parser = _envParse;
	    return _envParse.call(self, syntax, lang, data);
	  }
	};

	_l20nCommon.Env.prototype._getResource = function _getResource(lang, res) {
	  var self = this;
	  var syntax, entries;
	  if (res === 'staticResource') {
	    entries = window.navigator.languageMessages && window.navigator.languageMessages[lang.code] || {};
	    syntax = 'json';
	  } else if (res.substr(res.lastIndexOf('.') + 1) === 'json') {
	    syntax = 'json';
	  }

	  if (syntax === 'json') {
	    var cache = this._resCache;
	    var id = res + lang.code + lang.src;

	    if (cache.has(id)) {
	      return cache.get(id);
	    }

	    var syntax = 'json';

	    var saveEntries = function saveEntries(data) {
	      var _entries = self._parse(syntax, lang, data);
	      cache.set(id, self._create(lang, _entries));
	    };

	    var recover = function recover(err) {
	      err.lang = lang;
	      self.emit('fetcherror', err);
	      cache.set(id, err);
	    };
	    if (entries) {
	      var resource = Promise.resolve(entries).then(saveEntries, recover);
	    } else {
	      var langToFetch = lang.src === 'pseudo' ? { code: this.defaultLang, src: 'app' } : lang;
	      var resource = this.fetchResource(res, langToFetch).then(saveEntries, recover);
	    }

	    cache.set(id, resource);

	    return resource;
	  } else {
	    return _envGetResource.call(this, lang, res);
	  }
	};

	function broadcast(type, data) {
	  Array.from(this.ctxs.keys()).forEach(function (client) {
	    return client.emit(type, data);
	  });
	}

	exports.pseudo = _l20nCommon.pseudo;
	exports.broadcast = broadcast;
	exports.fetchResource = _l20nCommon.fetchResource;
	exports.Env = _l20nCommon.Env;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.getResourceLinks = getResourceLinks;
	exports.getMeta = getMeta;
	exports.negotiateLanguages = negotiateLanguages;

	var _bridge = __webpack_require__(1);

	/**
	 * extname = json|properties|l20n
	 * <link rel="localization" href="[path]/{locale}.{extname}"/>
	 * @param {*} head 
	 */
	function getResourceLinks(head, defaultLang) {
	  var resIds = Array.prototype.map.call(head.querySelectorAll('link[rel="localization"]'), function (el) {
	    if (defaultLang) {
	      return el.getAttribute('href').replace(/\/[\w-_]*(\.\w*)(\?[#a-z0-9=\.]+)?$/, function ($0, $1, $2) {
	        return '/{locale}' + $1 + ($2 || '');
	      });
	    } else {
	      return el.getAttribute('href');
	    }
	  });

	  if (window.navigator.defaultLanguageMessage) {
	    window.navigator.languageMessages = window.navigator.languageMessages || {};
	    if (!window.navigator.languageMessages[defaultLang]) {
	      window.navigator.languageMessages[defaultLang] = window.navigator.defaultLanguageMessage;
	    }
	    resIds.push('staticResource');
	  }

	  return resIds;
	}

	/**
	 * meta: 
	 *  1. 可用语言：availableLanguages -> availableLangs,  'a:v1,b'
	 *  2. 默认语言：defaultLanguage,  'a:v1'
	 *  3. 当前语言的版本：appVersion, 
	 *  4. 语言包路径：langDir
	 * ``` 
	 *  availableLangs = {
	 *    lang1: NaN,
	 *    lang2: v1
	 *  }
	 * ```
	 * @param {*} head 
	 */
	function getMeta(head) {
	  var availableLangs = Object.create(null);
	  var defaultLang = null;
	  var appVersion = null;
	  var langDir = null;

	  // XXX take last found instead of first?
	  var metas = head.querySelectorAll('meta[name="availableLanguages"],' + 'meta[name="defaultLanguage"],' + 'meta[name="appVersion"],' + 'meta[name="langDir"]');
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = metas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var meta = _step.value;

	      var name = meta.getAttribute('name');
	      var content = meta.getAttribute('content').trim();
	      switch (name) {
	        case 'availableLanguages':
	          availableLangs = getLangRevisionMap(availableLangs, content);
	          break;
	        case 'defaultLanguage':
	          var _getLangRevisionTuple = getLangRevisionTuple(content),
	              _getLangRevisionTuple2 = _slicedToArray(_getLangRevisionTuple, 2),
	              lang = _getLangRevisionTuple2[0],
	              rev = _getLangRevisionTuple2[1];

	          defaultLang = lang;
	          if (!(lang in availableLangs)) {
	            availableLangs[lang] = rev;
	          }
	          break;
	        case 'appVersion':
	          appVersion = content;
	          break;
	        case 'langDir':
	          langDir = content;
	          break;
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }

	  return {
	    defaultLang: defaultLang,
	    availableLangs: availableLangs,
	    appVersion: appVersion,
	    langDir: langDir
	  };
	}

	function getLangRevisionMap(seq, str) {
	  return str.split(',').reduce(function (seq, cur) {
	    var _getLangRevisionTuple3 = getLangRevisionTuple(cur),
	        _getLangRevisionTuple4 = _slicedToArray(_getLangRevisionTuple3, 2),
	        lang = _getLangRevisionTuple4[0],
	        rev = _getLangRevisionTuple4[1];

	    seq[lang] = rev;
	    return seq;
	  }, seq);
	}

	function getLangRevisionTuple(str) {
	  var _str$trim$split = str.trim().split(':'),
	      _str$trim$split2 = _slicedToArray(_str$trim$split, 2),
	      lang = _str$trim$split2[0],
	      rev = _str$trim$split2[1];
	  // if revision is missing, use NaN


	  return [lang, parseInt(rev)];
	}

	/**
	 * 可用语言 -> 识别可用的新语言 -> 待请求语言对象（pseudo, app, extra) -> 判断新旧语言发生变化时调用
	 * 
	 * src: extra的条件为：dom.target === appVersion && dom.revision > version
	 * 
	 * @param {*} fn 
	 * @param {*} appVersion 版本
	 * @param {*} defaultLang 默认语言
	 * @param {*} availableLangs 可用语言k-v
	 * @param {*} additionalLangs 可选语言
	 * @param {*} prevLangs 当前语言
	 * @param {*} requestedLangs 新的语言 
	 */
	function negotiateLanguages(fn, appVersion, defaultLang, availableLangs, additionalLangs, prevLangs, requestedLangs) {

	  var allAvailableLangs = Object.keys(availableLangs).concat(additionalLangs || []).concat(Object.keys(_bridge.pseudo));
	  var newLangs = prioritizeLocales(defaultLang, allAvailableLangs, requestedLangs);

	  var langs = newLangs.map(function (code) {
	    return {
	      code: code,
	      src: getLangSource(appVersion, availableLangs, additionalLangs, code)
	    };
	  });

	  if (!arrEqual(prevLangs, newLangs)) {
	    fn(langs);
	  }

	  return langs;
	}

	function arrEqual(arr1, arr2) {
	  return arr1.length === arr2.length && arr1.every(function (elem, i) {
	    return elem === arr2[i];
	  });
	}

	function getMatchingLangpack(appVersion, langpacks) {
	  for (var i = 0, langpack; langpack = langpacks[i]; i++) {
	    if (langpack.target === appVersion) {
	      return langpack;
	    }
	  }
	  return null;
	}

	function prioritizeLocales(def, availableLangs, requested) {
	  var supportedLocale = void 0;
	  // Find the first locale in the requested list that is supported.
	  for (var i = 0; i < requested.length; i++) {
	    var locale = requested[i];
	    if (availableLangs.indexOf(locale) !== -1) {
	      supportedLocale = locale;
	      break;
	    }
	  }
	  if (!supportedLocale || supportedLocale === def) {
	    return [def];
	  }

	  return [supportedLocale, def];
	}

	// extra是firefox扩展，pseudo应该是firefox os的语言
	// 真正我们用到的是app
	function getLangSource(appVersion, availableLangs, additionalLangs, code) {
	  if (additionalLangs && additionalLangs[code]) {
	    var lp = getMatchingLangpack(appVersion, additionalLangs[code]);
	    if (lp && (!(code in availableLangs) || parseInt(lp.revision) > availableLangs[code])) {
	      return 'extra';
	    }
	  }

	  if (code in _bridge.pseudo && !(code in availableLangs)) {
	    return 'pseudo';
	  }

	  return 'app';
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	// Polyfill NodeList.prototype[Symbol.iterator] for Chrome.
	// See https://code.google.com/p/chromium/issues/detail?id=401699

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.documentReady = documentReady;
	exports.getDirection = getDirection;
	if (typeof NodeList === 'function' && !NodeList.prototype[Symbol.iterator]) {
	  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	}

	// A document.ready shim
	// https://github.com/whatwg/html/issues/127
	function documentReady() {
	  if (document.readyState !== 'loading') {
	    return Promise.resolve();
	  }

	  return new Promise(function (resolve) {
	    document.addEventListener('readystatechange', function onrsc() {
	      document.removeEventListener('readystatechange', onrsc);
	      resolve();
	    });
	  });
	}

	// Intl.Locale
	function getDirection(code) {
	  var tag = code.split('-')[0];
	  return ['ar', 'he', 'fa', 'ps', 'ur'].indexOf(tag) >= 0 ? 'rtl' : 'ltr';
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	//重新定义l20n的id属性名和args属性名

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var l20nName = {
	  NAME: 'data-l20n',
	  ATTRIBUTE: 'data-l20n-args',
	  OPTIONS: 'data-l20n-options'
	};
	exports.l20nName = l20nName;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * 提供一些接口，用于根据key获取文本描述，然后替换key所在的标签的innerHTML和attribute
	 */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setAttributes = setAttributes;
	exports.getAttributes = getAttributes;
	exports.translateMutations = translateMutations;
	exports.translateFragment = translateFragment;
	exports.getFragmentTranslation = getFragmentTranslation;

	var _overlay = __webpack_require__(6);

	var _key = __webpack_require__(4);

	var reHtml = /[&<>]/g;
	// !add: l20n的属性名通过../key.js来设定

	var htmlEntities = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;'
	};

	function setAttributes(element, id, args) {
	  element.setAttribute(_key.l20nName.NAME, id);
	  if (args) {
	    element.setAttribute(_key.l20nName.ATTRIBUTE, JSON.stringify(args));
	  }
	}

	function getAttributes(element) {
	  return {
	    id: element.getAttribute(_key.l20nName.NAME),
	    args: JSON.parse(element.getAttribute(_key.l20nName.ATTRIBUTE))
	  };
	}
	// <div data-l20n="a"><div data-l20n="b">...</div></div>
	// => [
	//    div[data-l20n="a"],
	//    div[data-l20n="b"],
	//    ...
	//  ]
	function getTranslatables(element) {
	  var nodes = Array.from(element.querySelectorAll('[' + _key.l20nName.NAME + ']'));

	  if (typeof element.hasAttribute === 'function' && element.hasAttribute(_key.l20nName.NAME)) {
	    nodes.push(element);
	  }

	  return nodes;
	}

	//mutations是被观察的对象
	//more: https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
	//mutations.type="attributes", 说明被观察的dom的属性名有变更
	//mutations.type="childList", mutation.addedNodes 说明是新添了节点
	function translateMutations(view, langs, mutations) {
	  var targets = new Set();

	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = mutations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var mutation = _step.value;

	      switch (mutation.type) {
	        case 'attributes':
	          targets.add(mutation.target);
	          break;
	        case 'childList':
	          var _iteratorNormalCompletion2 = true;
	          var _didIteratorError2 = false;
	          var _iteratorError2 = undefined;

	          try {
	            for (var _iterator2 = mutation.addedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	              var addedNode = _step2.value;

	              //nodeType=1时，等同于ELEMENT_NODE, 是属性节点
	              //more: http://www.w3school.com.cn/jsref/prop_node_nodetype.asp
	              if (addedNode.nodeType === addedNode.ELEMENT_NODE) {
	                if (addedNode.childElementCount) {
	                  getTranslatables(addedNode).forEach(targets.add.bind(targets));
	                } else {
	                  if (addedNode.hasAttribute(_key.l20nName.NAME)) {
	                    targets.add(addedNode);
	                  }
	                }
	              }
	            }
	          } catch (err) {
	            _didIteratorError2 = true;
	            _iteratorError2 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                _iterator2.return();
	              }
	            } finally {
	              if (_didIteratorError2) {
	                throw _iteratorError2;
	              }
	            }
	          }

	          break;
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }

	  if (targets.size === 0) {
	    return;
	  }
	  //渲染key所对应的html结构
	  translateElements(view, langs, Array.from(targets));
	}

	function translateFragment(view, langs, frag) {
	  return translateElements(view, langs, getTranslatables(frag));
	}
	//获取key对应的值和属性
	function getElementsTranslation(view, langs, elems) {
	  var keys = elems.map(function (elem) {
	    var id = elem.getAttribute(_key.l20nName.NAME);
	    var args = elem.getAttribute(_key.l20nName.ATTRIBUTE);
	    return args ? [id,
	    //在args中的文本去除实体转义
	    JSON.parse(args.replace(reHtml, function (match) {
	      return htmlEntities[match];
	    }))] : id;
	  });

	  return view._resolveEntities(langs, keys);
	}

	function translateElements(view, langs, elements) {
	  return getElementsTranslation(view, langs, elements).then(function (translations) {
	    return applyTranslations(view, elements, translations);
	  });
	}
	//替换html
	function applyTranslations(view, elems, translations) {
	  view._disconnect();
	  for (var i = 0; i < elems.length; i++) {
	    (0, _overlay.overlayElement)(elems[i], translations[i]);
	  }
	  view._observe();
	}

	//new！ 开放给l20n-ng
	function getFragmentTranslation(remote, langs, frag) {
	  var elems = getTranslatables(frag);
	  var keys = elems.map(function (elem) {
	    var id = elem.getAttribute(_key.l20nName.NAME);
	    var args = elem.getAttribute(_key.l20nName.ATTRIBUTE);
	    return args ? [id,
	    //在args中的文本去除实体转义
	    JSON.parse(args.replace(reHtml, function (match) {
	      return htmlEntities[match];
	    }))] : id;
	  });

	  return remote.resolveEntities(remote.id, langs, keys).then(function (translations) {
	    for (var i = 0; i < elems.length; i++) {
	      (0, _overlay.overlayElement)(elems[i], translations[i]);
	    }
	  });
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	// match the opening angle bracket (<) in HTML tags, and HTML entities like
	// &amp;, &#0038;, &#x0026;.
	// 用来判断是否是实体转义字符

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.overlayElement = overlayElement;
	var reOverlay = /<|&#?\w+;/;

	var allowed = {
	  elements: ['a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr'],
	  attributes: {
	    global: ['title', 'aria-label', 'aria-valuetext', 'aria-moz-hint'],
	    a: ['download'],
	    area: ['download', 'alt'],
	    // value is special-cased in isAttrAllowed
	    input: ['alt', 'placeholder'],
	    menuitem: ['label'],
	    menu: ['label'],
	    optgroup: ['label'],
	    option: ['label'],
	    track: ['label'],
	    img: ['alt'],
	    textarea: ['placeholder'],
	    th: ['abbr']
	  }
	};
	//更新元素，translation是经过处理的[id, args]=>{value: xx, attrs: object}
	//example:
	// a=xx
	// a.b=xx
	// 调用类似l20n.get('a') 获取文本=>
	// {
	//  value: xx,
	//  attrs: {
	//    b: {
	//      value: xx
	//    }
	//  }
	// }
	function overlayElement(element, translation) {
	  var value = translation.value;

	  if (typeof value === 'string') {
	    if (!reOverlay.test(value)) {
	      element.textContent = value;
	    } else {
	      // start with an inert template element and move its children into
	      // `element` but such that `element`'s own children are not replaced
	      var tmpl = element.ownerDocument.createElement('template');
	      tmpl.innerHTML = value;
	      // overlay the node with the DocumentFragment
	      overlay(element, tmpl.content);
	    }
	  }
	  //多级属性其实是用来替换标签上的属性的。
	  for (var key in translation.attrs) {
	    var attrName = camelCaseToDashed(key);
	    if (isAttrAllowed({ name: attrName }, element)) {
	      element.setAttribute(attrName, translation.attrs[key]);
	    }
	  }
	}

	// The goal of overlay is to move the children of `translationElement`
	// into `sourceElement` such that `sourceElement`'s own children are not
	// replaced, but onle have their text nodes and their attributes modified.
	//
	// We want to make it possible for localizers to apply text-level semantics to
	// the translations and make use of HTML entities. At the same time, we
	// don't trust translations so we need to filter unsafe elements and
	// attribtues out and we don't want to break the Web by replacing elements to
	// which third-party code might have created references (e.g. two-way
	// bindings in MVC frameworks).
	// 当文本的定义如下：
	// a=xxx<span class="h">sss</span>sss
	// 这种情况下，a的文本其实需要替换a对应的标签下的html结构
	// <div data-l20n="a">test<span>1</span>!
	// 替换后的结果是：
	// <div data-l20n="a">xxx<span class="h">sss</span>sss
	function overlay(sourceElement, translationElement) {
	  var result = translationElement.ownerDocument.createDocumentFragment();
	  var k = void 0,
	      attr = void 0;

	  // take one node from translationElement at a time and check it against
	  // the allowed list or try to match it with a corresponding element
	  // in the source
	  var childElement = void 0;
	  while (childElement = translationElement.childNodes[0]) {
	    translationElement.removeChild(childElement);
	    //文本节点，则追加
	    if (childElement.nodeType === childElement.TEXT_NODE) {
	      result.appendChild(childElement);
	      continue;
	    }

	    var index = getIndexOfType(childElement);
	    var sourceChild = getNthElementOfType(sourceElement, childElement, index);
	    if (sourceChild) {
	      // there is a corresponding element in the source, let's use it
	      // 嵌套结构，嵌套调用
	      overlay(sourceChild, childElement);
	      result.appendChild(sourceChild);
	      continue;
	    }
	    //文本中的标签是由白名单判断的，不是白名单中的不可做修改
	    if (isElementAllowed(childElement)) {
	      var sanitizedChild = childElement.ownerDocument.createElement(childElement.nodeName);
	      overlay(sanitizedChild, childElement);
	      result.appendChild(sanitizedChild);
	      continue;
	    }

	    // otherwise just take this child's textContent
	    result.appendChild(translationElement.ownerDocument.createTextNode(childElement.textContent));
	  }

	  // clear `sourceElement` and append `result` which by this time contains
	  // `sourceElement`'s original children, overlayed with translation
	  sourceElement.textContent = '';
	  sourceElement.appendChild(result);

	  // if we're overlaying a nested element, translate the allowed
	  // attributes; top-level attributes are handled in `translateElement`
	  // XXX attributes previously set here for another language should be
	  // cleared if a new language doesn't use them; https://bugzil.la/922577
	  // 属性需要在白名单中的属性列表，才会做变更
	  // key:title="test"
	  // <div data-l20n="key" title="no test">..</div>
	  // 替换完后为：
	  // <div data-l20n="key" title="test">..</div>
	  if (translationElement.attributes) {
	    for (k = 0, attr; attr = translationElement.attributes[k]; k++) {
	      if (isAttrAllowed(attr, sourceElement)) {
	        sourceElement.setAttribute(attr.name, attr.value);
	      }
	    }
	  }
	}

	// XXX the allowed list should be amendable; https://bugzil.la/922573
	function isElementAllowed(element) {
	  return allowed.elements.indexOf(element.tagName.toLowerCase()) !== -1;
	}

	function isAttrAllowed(attr, element) {
	  var attrName = attr.name.toLowerCase();
	  var tagName = element.tagName.toLowerCase();
	  // is it a globally safe attribute?
	  if (allowed.attributes.global.indexOf(attrName) !== -1) {
	    return true;
	  }
	  // are there no allowed attributes for this element?
	  if (!allowed.attributes[tagName]) {
	    return false;
	  }
	  // is it allowed on this element?
	  // XXX the allowed list should be amendable; https://bugzil.la/922573
	  if (allowed.attributes[tagName].indexOf(attrName) !== -1) {
	    return true;
	  }
	  // special case for value on inputs with type button, reset, submit
	  if (tagName === 'input' && attrName === 'value') {
	    var type = element.type.toLowerCase();
	    if (type === 'submit' || type === 'button' || type === 'reset') {
	      return true;
	    }
	  }
	  return false;
	}

	// Get n-th immediate child of context that is of the same type as element.
	// XXX Use querySelector(':scope > ELEMENT:nth-of-type(index)'), when:
	// 1) :scope is widely supported in more browsers and 2) it works with
	// DocumentFragments.
	function getNthElementOfType(context, element, index) {
	  /* jshint boss:true */
	  var nthOfType = 0;
	  for (var i = 0, child; child = context.children[i]; i++) {
	    if (child.nodeType === child.ELEMENT_NODE && child.tagName === element.tagName) {
	      if (nthOfType === index) {
	        return child;
	      }
	      nthOfType++;
	    }
	  }
	  return null;
	}

	// Get the index of the element among siblings of the same type.
	function getIndexOfType(element) {
	  var index = 0;
	  var child = void 0;
	  while (child = element.previousElementSibling) {
	    if (child.tagName === element.tagName) {
	      index++;
	    }
	  }
	  return index;
	}

	function camelCaseToDashed(string) {
	  // XXX workaround for https://bugzil.la/1141934
	  if (string === 'ariaValueText') {
	    return 'aria-valuetext';
	  }

	  return string.replace(/[A-Z]/g, function (match) {
	    return '-' + match.toLowerCase();
	  }).replace(/^-/, '');
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError('Cannot call a class as a function');
	  }
	}

	function L10nError(message, id, lang) {
	  this.name = 'L10nError';
	  this.message = message;
	  this.id = id;
	  this.lang = lang;
	}
	L10nError.prototype = Object.create(Error.prototype);
	L10nError.prototype.constructor = L10nError;

	function load(type, url) {
	  return new Promise(function (resolve, reject) {
	    var xhr = new XMLHttpRequest();

	    if (xhr.overrideMimeType) {
	      xhr.overrideMimeType(type);
	    }

	    xhr.open('GET', url, true);

	    if (type === 'application/json') {
	      xhr.responseType = 'json';
	    }

	    xhr.addEventListener('load', function io_onload(e) {
	      if (e.target.status === 200 || e.target.status === 0) {
	        resolve(e.target.response || e.target.responseText);
	      } else {
	        reject(new L10nError('Not found: ' + url));
	      }
	    });
	    xhr.addEventListener('error', reject);
	    xhr.addEventListener('timeout', reject);

	    try {
	      xhr.send(null);
	    } catch (e) {
	      if (e.name === 'NS_ERROR_FILE_NOT_FOUND') {
	        reject(new L10nError('Not found: ' + url));
	      } else {
	        throw e;
	      }
	    }
	  });
	}

	var io = {
	  extra: function (code, ver, path, type) {
	    return navigator.mozApps.getLocalizationResource(code, ver, path, type);
	  },
	  app: function (code, ver, path, type) {
	    switch (type) {
	      case 'text':
	        return load('text/plain', path);
	      case 'json':
	        return load('application/json', path);
	      default:
	        throw new L10nError('Unknown file type: ' + type);
	    }
	  }
	};

	function fetchResource$1(ver, res, lang) {
	  var url = res.replace('{locale}', lang.code);
	  var type = res.endsWith('.json') ? 'json' : 'text';
	  return io[lang.src](lang.code, ver, url, type);
	}

	var MAX_PLACEABLES$1 = 100;

	var L20nParser = {
	  parse: function (emit, string) {
	    this._source = string;
	    this._index = 0;
	    this._length = string.length;
	    this.entries = Object.create(null);
	    this.emit = emit;

	    return this.getResource();
	  },

	  getResource: function () {
	    this.getWS();
	    while (this._index < this._length) {
	      try {
	        this.getEntry();
	      } catch (e) {
	        if (e instanceof L10nError) {
	          this.getJunkEntry();
	          if (!this.emit) {
	            throw e;
	          }
	        } else {
	          throw e;
	        }
	      }

	      if (this._index < this._length) {
	        this.getWS();
	      }
	    }

	    return this.entries;
	  },

	  getEntry: function () {
	    if (this._source[this._index] === '<') {
	      ++this._index;
	      var id = this.getIdentifier();
	      if (this._source[this._index] === '[') {
	        ++this._index;
	        return this.getEntity(id, this.getItemList(this.getExpression, ']'));
	      }
	      return this.getEntity(id);
	    }

	    if (this._source.startsWith('/*', this._index)) {
	      return this.getComment();
	    }

	    throw this.error('Invalid entry');
	  },

	  getEntity: function (id, index) {
	    if (!this.getRequiredWS()) {
	      throw this.error('Expected white space');
	    }

	    var ch = this._source[this._index];
	    var value = this.getValue(ch, index === undefined);
	    var attrs = undefined;

	    if (value === undefined) {
	      if (ch === '>') {
	        throw this.error('Expected ">"');
	      }
	      attrs = this.getAttributes();
	    } else {
	      var ws1 = this.getRequiredWS();
	      if (this._source[this._index] !== '>') {
	        if (!ws1) {
	          throw this.error('Expected ">"');
	        }
	        attrs = this.getAttributes();
	      }
	    }

	    ++this._index;

	    if (id in this.entries) {
	      throw this.error('Duplicate entry ID "' + id, 'duplicateerror');
	    }
	    if (!attrs && !index && typeof value === 'string') {
	      this.entries[id] = value;
	    } else {
	      this.entries[id] = {
	        value: value,
	        attrs: attrs,
	        index: index
	      };
	    }
	  },

	  getValue: function () {
	    var ch = arguments.length <= 0 || arguments[0] === undefined ? this._source[this._index] : arguments[0];
	    var optional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	    switch (ch) {
	      case '\'':
	      case '"':
	        return this.getString(ch, 1);
	      case '{':
	        return this.getHash();
	    }

	    if (!optional) {
	      throw this.error('Unknown value type');
	    }

	    return;
	  },

	  getWS: function () {
	    var cc = this._source.charCodeAt(this._index);

	    while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
	      cc = this._source.charCodeAt(++this._index);
	    }
	  },

	  getRequiredWS: function () {
	    var pos = this._index;
	    var cc = this._source.charCodeAt(pos);

	    while (cc === 32 || cc === 10 || cc === 9 || cc === 13) {
	      cc = this._source.charCodeAt(++this._index);
	    }
	    return this._index !== pos;
	  },

	  getIdentifier: function () {
	    var start = this._index;
	    var cc = this._source.charCodeAt(this._index);

	    if (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95) {
	      cc = this._source.charCodeAt(++this._index);
	    } else {
	      throw this.error('Identifier has to start with [a-zA-Z_]');
	    }

	    while (cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95) {
	      cc = this._source.charCodeAt(++this._index);
	    }

	    return this._source.slice(start, this._index);
	  },

	  getUnicodeChar: function () {
	    for (var i = 0; i < 4; i++) {
	      var cc = this._source.charCodeAt(++this._index);
	      if (cc > 96 && cc < 103 || cc > 64 && cc < 71 || cc > 47 && cc < 58) {
	        continue;
	      }
	      throw this.error('Illegal unicode escape sequence');
	    }
	    this._index++;
	    return String.fromCharCode(parseInt(this._source.slice(this._index - 4, this._index), 16));
	  },

	  stringRe: /"|'|{{|\\/g,
	  getString: function (opchar, opcharLen) {
	    var body = [];
	    var placeables = 0;

	    this._index += opcharLen;
	    var start = this._index;

	    var bufStart = start;
	    var buf = '';

	    while (true) {
	      this.stringRe.lastIndex = this._index;
	      var match = this.stringRe.exec(this._source);

	      if (!match) {
	        throw this.error('Unclosed string literal');
	      }

	      if (match[0] === '"' || match[0] === '\'') {
	        if (match[0] !== opchar) {
	          this._index += opcharLen;
	          continue;
	        }
	        this._index = match.index + opcharLen;
	        break;
	      }

	      if (match[0] === '{{') {
	        if (placeables > MAX_PLACEABLES$1 - 1) {
	          throw this.error('Too many placeables, maximum allowed is ' + MAX_PLACEABLES$1);
	        }
	        placeables++;
	        if (match.index > bufStart || buf.length > 0) {
	          body.push(buf + this._source.slice(bufStart, match.index));
	          buf = '';
	        }
	        this._index = match.index + 2;
	        this.getWS();
	        body.push(this.getExpression());
	        this.getWS();
	        this._index += 2;
	        bufStart = this._index;
	        continue;
	      }

	      if (match[0] === '\\') {
	        this._index = match.index + 1;
	        var ch2 = this._source[this._index];
	        if (ch2 === 'u') {
	          buf += this._source.slice(bufStart, match.index) + this.getUnicodeChar();
	        } else if (ch2 === opchar || ch2 === '\\') {
	          buf += this._source.slice(bufStart, match.index) + ch2;
	          this._index++;
	        } else if (this._source.startsWith('{{', this._index)) {
	          buf += this._source.slice(bufStart, match.index) + '{{';
	          this._index += 2;
	        } else {
	          throw this.error('Illegal escape sequence');
	        }
	        bufStart = this._index;
	      }
	    }

	    if (body.length === 0) {
	      return buf + this._source.slice(bufStart, this._index - opcharLen);
	    }

	    if (this._index - opcharLen > bufStart || buf.length > 0) {
	      body.push(buf + this._source.slice(bufStart, this._index - opcharLen));
	    }

	    return body;
	  },

	  getAttributes: function () {
	    var attrs = Object.create(null);

	    while (true) {
	      this.getAttribute(attrs);
	      var ws1 = this.getRequiredWS();
	      var ch = this._source.charAt(this._index);
	      if (ch === '>') {
	        break;
	      } else if (!ws1) {
	        throw this.error('Expected ">"');
	      }
	    }
	    return attrs;
	  },

	  getAttribute: function (attrs) {
	    var key = this.getIdentifier();
	    var index = undefined;

	    if (this._source[this._index] === '[') {
	      ++this._index;
	      this.getWS();
	      index = this.getItemList(this.getExpression, ']');
	    }
	    this.getWS();
	    if (this._source[this._index] !== ':') {
	      throw this.error('Expected ":"');
	    }
	    ++this._index;
	    this.getWS();
	    var value = this.getValue();

	    if (key in attrs) {
	      throw this.error('Duplicate attribute "' + key, 'duplicateerror');
	    }

	    if (!index && typeof value === 'string') {
	      attrs[key] = value;
	    } else {
	      attrs[key] = {
	        value: value,
	        index: index
	      };
	    }
	  },

	  getHash: function () {
	    var items = Object.create(null);

	    ++this._index;
	    this.getWS();

	    var defKey = undefined;

	    while (true) {
	      var _getHashItem = this.getHashItem();

	      var key = _getHashItem[0];
	      var value = _getHashItem[1];
	      var def = _getHashItem[2];

	      items[key] = value;

	      if (def) {
	        if (defKey) {
	          throw this.error('Default item redefinition forbidden');
	        }
	        defKey = key;
	      }
	      this.getWS();

	      var comma = this._source[this._index] === ',';
	      if (comma) {
	        ++this._index;
	        this.getWS();
	      }
	      if (this._source[this._index] === '}') {
	        ++this._index;
	        break;
	      }
	      if (!comma) {
	        throw this.error('Expected "}"');
	      }
	    }

	    if (defKey) {
	      items.__default = defKey;
	    }

	    return items;
	  },

	  getHashItem: function () {
	    var defItem = false;
	    if (this._source[this._index] === '*') {
	      ++this._index;
	      defItem = true;
	    }

	    var key = this.getIdentifier();
	    this.getWS();
	    if (this._source[this._index] !== ':') {
	      throw this.error('Expected ":"');
	    }
	    ++this._index;
	    this.getWS();

	    return [key, this.getValue(), defItem];
	  },

	  getComment: function () {
	    this._index += 2;
	    var start = this._index;
	    var end = this._source.indexOf('*/', start);

	    if (end === -1) {
	      throw this.error('Comment without a closing tag');
	    }

	    this._index = end + 2;
	  },

	  getExpression: function () {
	    var exp = this.getPrimaryExpression();

	    while (true) {
	      var ch = this._source[this._index];
	      if (ch === '.' || ch === '[') {
	        ++this._index;
	        exp = this.getPropertyExpression(exp, ch === '[');
	      } else if (ch === '(') {
	        ++this._index;
	        exp = this.getCallExpression(exp);
	      } else {
	        break;
	      }
	    }

	    return exp;
	  },

	  getPropertyExpression: function (idref, computed) {
	    var exp = undefined;

	    if (computed) {
	      this.getWS();
	      exp = this.getExpression();
	      this.getWS();
	      if (this._source[this._index] !== ']') {
	        throw this.error('Expected "]"');
	      }
	      ++this._index;
	    } else {
	      exp = this.getIdentifier();
	    }

	    return {
	      type: 'prop',
	      expr: idref,
	      prop: exp,
	      cmpt: computed
	    };
	  },

	  getCallExpression: function (callee) {
	    this.getWS();

	    return {
	      type: 'call',
	      expr: callee,
	      args: this.getItemList(this.getExpression, ')')
	    };
	  },

	  getPrimaryExpression: function () {
	    var ch = this._source[this._index];

	    switch (ch) {
	      case '$':
	        ++this._index;
	        return {
	          type: 'var',
	          name: this.getIdentifier()
	        };
	      case '@':
	        ++this._index;
	        return {
	          type: 'glob',
	          name: this.getIdentifier()
	        };
	      default:
	        return {
	          type: 'id',
	          name: this.getIdentifier()
	        };
	    }
	  },

	  getItemList: function (callback, closeChar) {
	    var items = [];
	    var closed = false;

	    this.getWS();

	    if (this._source[this._index] === closeChar) {
	      ++this._index;
	      closed = true;
	    }

	    while (!closed) {
	      items.push(callback.call(this));
	      this.getWS();
	      var ch = this._source.charAt(this._index);
	      switch (ch) {
	        case ',':
	          ++this._index;
	          this.getWS();
	          break;
	        case closeChar:
	          ++this._index;
	          closed = true;
	          break;
	        default:
	          throw this.error('Expected "," or "' + closeChar + '"');
	      }
	    }

	    return items;
	  },

	  getJunkEntry: function () {
	    var pos = this._index;
	    var nextEntity = this._source.indexOf('<', pos);
	    var nextComment = this._source.indexOf('/*', pos);

	    if (nextEntity === -1) {
	      nextEntity = this._length;
	    }
	    if (nextComment === -1) {
	      nextComment = this._length;
	    }

	    var nextEntry = Math.min(nextEntity, nextComment);

	    this._index = nextEntry;
	  },

	  error: function (message) {
	    var type = arguments.length <= 1 || arguments[1] === undefined ? 'parsererror' : arguments[1];

	    var pos = this._index;

	    var start = this._source.lastIndexOf('<', pos - 1);
	    var lastClose = this._source.lastIndexOf('>', pos - 1);
	    start = lastClose > start ? lastClose + 1 : start;
	    var context = this._source.slice(start, pos + 10);

	    var msg = message + ' at pos ' + pos + ': `' + context + '`';
	    var err = new L10nError(msg);
	    if (this.emit) {
	      this.emit(type, err);
	    }
	    return err;
	  }
	};

	var MAX_PLACEABLES = 100;

	var PropertiesParser = {
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

	  parse: function (emit, source) {
	    if (!this.patterns) {
	      this.init();
	    }
	    this.emit = emit;

	    var entries = {};

	    var lines = source.match(this.patterns.entries);
	    if (!lines) {
	      return entries;
	    }
	    for (var i = 0; i < lines.length; i++) {
	      var line = lines[i];

	      if (this.patterns.comment.test(line)) {
	        continue;
	      }

	      while (this.patterns.multiline.test(line) && i < lines.length) {
	        line = line.slice(0, -1) + lines[++i].trim();
	      }

	      var entityMatch = line.match(this.patterns.entity);
	      if (entityMatch) {
	        try {
	          this.parseEntity(entityMatch[1], entityMatch[2], entries);
	        } catch (e) {
	          if (!this.emit) {
	            throw e;
	          }
	        }
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

	    var nameElements = name.split('.');

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

	var KNOWN_MACROS = ['plural'];
	var MAX_PLACEABLE_LENGTH = 2500;

	var FSI = '⁨';
	var PDI = '⁩';

	var resolutionChain = new WeakSet();

	function format(ctx, lang, args, entity) {
	  if (typeof entity === 'string') {
	    return [{}, entity];
	  }

	  if (resolutionChain.has(entity)) {
	    throw new L10nError('Cyclic reference detected');
	  }

	  resolutionChain.add(entity);

	  var rv = undefined;

	  try {
	    rv = resolveValue({}, ctx, lang, args, entity.value, entity.index);
	  } finally {
	    resolutionChain.delete(entity);
	  }
	  return rv;
	}

	function resolveIdentifier(ctx, lang, args, id) {
	  if (KNOWN_MACROS.indexOf(id) > -1) {
	    return [{}, ctx._getMacro(lang, id)];
	  }

	  if (args && args.hasOwnProperty(id)) {
	    if (typeof args[id] === 'string' || typeof args[id] === 'number' && !isNaN(args[id])) {
	      return [{}, args[id]];
	    } else {
	      throw new L10nError('Arg must be a string or a number: ' + id);
	    }
	  }

	  if (id === '__proto__') {
	    throw new L10nError('Illegal id: ' + id);
	  }

	  var entity = ctx._getEntity(lang, id);

	  if (entity) {
	    return format(ctx, lang, args, entity);
	  }

	  throw new L10nError('Unknown reference: ' + id);
	}

	function subPlaceable(locals, ctx, lang, args, id) {
	  var newLocals = undefined,
	      value = undefined;

	  try {
	    var _resolveIdentifier = resolveIdentifier(ctx, lang, args, id);

	    newLocals = _resolveIdentifier[0];
	    value = _resolveIdentifier[1];
	  } catch (err) {
	    return [{ error: err }, FSI + '{{ ' + id + ' }}' + PDI];
	  }

	  if (typeof value === 'number') {
	    var formatter = ctx._getNumberFormatter(lang);
	    return [newLocals, formatter.format(value)];
	  }

	  if (typeof value === 'string') {
	    if (value.length >= MAX_PLACEABLE_LENGTH) {
	      throw new L10nError('Too many characters in placeable (' + value.length + ', max allowed is ' + MAX_PLACEABLE_LENGTH + ')');
	    }
	    return [newLocals, FSI + value + PDI];
	  }

	  return [{}, FSI + '{{ ' + id + ' }}' + PDI];
	}

	function interpolate(locals, ctx, lang, args, arr) {
	  return arr.reduce(function (_ref, cur) {
	    var localsSeq = _ref[0];
	    var valueSeq = _ref[1];

	    if (typeof cur === 'string') {
	      return [localsSeq, valueSeq + cur];
	    } else {
	      var _subPlaceable = subPlaceable(locals, ctx, lang, args, cur.name);

	      var value = _subPlaceable[1];

	      return [localsSeq, valueSeq + value];
	    }
	  }, [locals, '']);
	}

	function resolveSelector(ctx, lang, args, expr, index) {
	  var selectorName = undefined;
	  if (index[0].type === 'call' && index[0].expr.type === 'prop' && index[0].expr.expr.name === 'cldr') {
	    selectorName = 'plural';
	  } else {
	    selectorName = index[0].name;
	  }
	  var selector = resolveIdentifier(ctx, lang, args, selectorName)[1];

	  if (typeof selector !== 'function') {
	    return selector;
	  }

	  var argValue = index[0].args ? resolveIdentifier(ctx, lang, args, index[0].args[0].name)[1] : undefined;

	  if (selectorName === 'plural') {
	    if (argValue === 0 && 'zero' in expr) {
	      return 'zero';
	    }
	    if (argValue === 1 && 'one' in expr) {
	      return 'one';
	    }
	    if (argValue === 2 && 'two' in expr) {
	      return 'two';
	    }
	  }

	  return selector(argValue);
	}

	function resolveValue(locals, ctx, lang, args, expr, index) {
	  if (!expr) {
	    return [locals, expr];
	  }

	  if (typeof expr === 'string' || typeof expr === 'boolean' || typeof expr === 'number') {
	    return [locals, expr];
	  }

	  if (Array.isArray(expr)) {
	    return interpolate(locals, ctx, lang, args, expr);
	  }

	  if (index) {
	    var selector = resolveSelector(ctx, lang, args, expr, index);
	    if (selector in expr) {
	      return resolveValue(locals, ctx, lang, args, expr[selector]);
	    }
	  }

	  var defaultKey = expr.__default || 'other';
	  if (defaultKey in expr) {
	    return resolveValue(locals, ctx, lang, args, expr[defaultKey]);
	  }

	  throw new L10nError('Unresolvable value');
	}

	var locales2rules = {
	  'af': 3,
	  'ak': 4,
	  'am': 4,
	  'ar': 1,
	  'asa': 3,
	  'az': 0,
	  'be': 11,
	  'bem': 3,
	  'bez': 3,
	  'bg': 3,
	  'bh': 4,
	  'bm': 0,
	  'bn': 3,
	  'bo': 0,
	  'br': 20,
	  'brx': 3,
	  'bs': 11,
	  'ca': 3,
	  'cgg': 3,
	  'chr': 3,
	  'cs': 12,
	  'cy': 17,
	  'da': 3,
	  'de': 3,
	  'dv': 3,
	  'dz': 0,
	  'ee': 3,
	  'el': 3,
	  'en': 3,
	  'eo': 3,
	  'es': 3,
	  'et': 3,
	  'eu': 3,
	  'fa': 0,
	  'ff': 5,
	  'fi': 3,
	  'fil': 4,
	  'fo': 3,
	  'fr': 5,
	  'fur': 3,
	  'fy': 3,
	  'ga': 8,
	  'gd': 24,
	  'gl': 3,
	  'gsw': 3,
	  'gu': 3,
	  'guw': 4,
	  'gv': 23,
	  'ha': 3,
	  'haw': 3,
	  'he': 2,
	  'hi': 4,
	  'hr': 11,
	  'hu': 0,
	  'id': 0,
	  'ig': 0,
	  'ii': 0,
	  'is': 3,
	  'it': 3,
	  'iu': 7,
	  'ja': 0,
	  'jmc': 3,
	  'jv': 0,
	  'ka': 0,
	  'kab': 5,
	  'kaj': 3,
	  'kcg': 3,
	  'kde': 0,
	  'kea': 0,
	  'kk': 3,
	  'kl': 3,
	  'km': 0,
	  'kn': 0,
	  'ko': 0,
	  'ksb': 3,
	  'ksh': 21,
	  'ku': 3,
	  'kw': 7,
	  'lag': 18,
	  'lb': 3,
	  'lg': 3,
	  'ln': 4,
	  'lo': 0,
	  'lt': 10,
	  'lv': 6,
	  'mas': 3,
	  'mg': 4,
	  'mk': 16,
	  'ml': 3,
	  'mn': 3,
	  'mo': 9,
	  'mr': 3,
	  'ms': 0,
	  'mt': 15,
	  'my': 0,
	  'nah': 3,
	  'naq': 7,
	  'nb': 3,
	  'nd': 3,
	  'ne': 3,
	  'nl': 3,
	  'nn': 3,
	  'no': 3,
	  'nr': 3,
	  'nso': 4,
	  'ny': 3,
	  'nyn': 3,
	  'om': 3,
	  'or': 3,
	  'pa': 3,
	  'pap': 3,
	  'pl': 13,
	  'ps': 3,
	  'pt': 3,
	  'rm': 3,
	  'ro': 9,
	  'rof': 3,
	  'ru': 11,
	  'rwk': 3,
	  'sah': 0,
	  'saq': 3,
	  'se': 7,
	  'seh': 3,
	  'ses': 0,
	  'sg': 0,
	  'sh': 11,
	  'shi': 19,
	  'sk': 12,
	  'sl': 14,
	  'sma': 7,
	  'smi': 7,
	  'smj': 7,
	  'smn': 7,
	  'sms': 7,
	  'sn': 3,
	  'so': 3,
	  'sq': 3,
	  'sr': 11,
	  'ss': 3,
	  'ssy': 3,
	  'st': 3,
	  'sv': 3,
	  'sw': 3,
	  'syr': 3,
	  'ta': 3,
	  'te': 3,
	  'teo': 3,
	  'th': 0,
	  'ti': 4,
	  'tig': 3,
	  'tk': 3,
	  'tl': 4,
	  'tn': 3,
	  'to': 0,
	  'tr': 0,
	  'ts': 3,
	  'tzm': 22,
	  'uk': 11,
	  'ur': 3,
	  've': 3,
	  'vi': 0,
	  'vun': 3,
	  'wa': 4,
	  'wae': 3,
	  'wo': 0,
	  'xh': 3,
	  'xog': 3,
	  'yo': 0,
	  'zh': 0,
	  'zu': 3
	};

	function isIn(n, list) {
	  return list.indexOf(n) !== -1;
	}
	function isBetween(n, start, end) {
	  return typeof n === typeof start && start <= n && n <= end;
	}

	var pluralRules = {
	  '0': function () {
	    return 'other';
	  },
	  '1': function (n) {
	    if (isBetween(n % 100, 3, 10)) {
	      return 'few';
	    }
	    if (n === 0) {
	      return 'zero';
	    }
	    if (isBetween(n % 100, 11, 99)) {
	      return 'many';
	    }
	    if (n === 2) {
	      return 'two';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '2': function (n) {
	    if (n !== 0 && n % 10 === 0) {
	      return 'many';
	    }
	    if (n === 2) {
	      return 'two';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '3': function (n) {
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '4': function (n) {
	    if (isBetween(n, 0, 1)) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '5': function (n) {
	    if (isBetween(n, 0, 2) && n !== 2) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '6': function (n) {
	    if (n === 0) {
	      return 'zero';
	    }
	    if (n % 10 === 1 && n % 100 !== 11) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '7': function (n) {
	    if (n === 2) {
	      return 'two';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '8': function (n) {
	    if (isBetween(n, 3, 6)) {
	      return 'few';
	    }
	    if (isBetween(n, 7, 10)) {
	      return 'many';
	    }
	    if (n === 2) {
	      return 'two';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '9': function (n) {
	    if (n === 0 || n !== 1 && isBetween(n % 100, 1, 19)) {
	      return 'few';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '10': function (n) {
	    if (isBetween(n % 10, 2, 9) && !isBetween(n % 100, 11, 19)) {
	      return 'few';
	    }
	    if (n % 10 === 1 && !isBetween(n % 100, 11, 19)) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '11': function (n) {
	    if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14)) {
	      return 'few';
	    }
	    if (n % 10 === 0 || isBetween(n % 10, 5, 9) || isBetween(n % 100, 11, 14)) {
	      return 'many';
	    }
	    if (n % 10 === 1 && n % 100 !== 11) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '12': function (n) {
	    if (isBetween(n, 2, 4)) {
	      return 'few';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '13': function (n) {
	    if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14)) {
	      return 'few';
	    }
	    if (n !== 1 && isBetween(n % 10, 0, 1) || isBetween(n % 10, 5, 9) || isBetween(n % 100, 12, 14)) {
	      return 'many';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '14': function (n) {
	    if (isBetween(n % 100, 3, 4)) {
	      return 'few';
	    }
	    if (n % 100 === 2) {
	      return 'two';
	    }
	    if (n % 100 === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '15': function (n) {
	    if (n === 0 || isBetween(n % 100, 2, 10)) {
	      return 'few';
	    }
	    if (isBetween(n % 100, 11, 19)) {
	      return 'many';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '16': function (n) {
	    if (n % 10 === 1 && n !== 11) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '17': function (n) {
	    if (n === 3) {
	      return 'few';
	    }
	    if (n === 0) {
	      return 'zero';
	    }
	    if (n === 6) {
	      return 'many';
	    }
	    if (n === 2) {
	      return 'two';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '18': function (n) {
	    if (n === 0) {
	      return 'zero';
	    }
	    if (isBetween(n, 0, 2) && n !== 0 && n !== 2) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '19': function (n) {
	    if (isBetween(n, 2, 10)) {
	      return 'few';
	    }
	    if (isBetween(n, 0, 1)) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '20': function (n) {
	    if ((isBetween(n % 10, 3, 4) || n % 10 === 9) && !(isBetween(n % 100, 10, 19) || isBetween(n % 100, 70, 79) || isBetween(n % 100, 90, 99))) {
	      return 'few';
	    }
	    if (n % 1000000 === 0 && n !== 0) {
	      return 'many';
	    }
	    if (n % 10 === 2 && !isIn(n % 100, [12, 72, 92])) {
	      return 'two';
	    }
	    if (n % 10 === 1 && !isIn(n % 100, [11, 71, 91])) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '21': function (n) {
	    if (n === 0) {
	      return 'zero';
	    }
	    if (n === 1) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '22': function (n) {
	    if (isBetween(n, 0, 1) || isBetween(n, 11, 99)) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '23': function (n) {
	    if (isBetween(n % 10, 1, 2) || n % 20 === 0) {
	      return 'one';
	    }
	    return 'other';
	  },
	  '24': function (n) {
	    if (isBetween(n, 3, 10) || isBetween(n, 13, 19)) {
	      return 'few';
	    }
	    if (isIn(n, [2, 12])) {
	      return 'two';
	    }
	    if (isIn(n, [1, 11])) {
	      return 'one';
	    }
	    return 'other';
	  }
	};

	function getPluralRule(code) {
	  var index = locales2rules[code.replace(/-.*$/, '')];
	  if (!(index in pluralRules)) {
	    return function () {
	      return 'other';
	    };
	  }
	  return pluralRules[index];
	}

	var Context = function () {
	  function Context(env) {
	    _classCallCheck(this, Context);

	    this._env = env;
	    this._numberFormatters = null;
	  }

	  Context.prototype._formatTuple = function _formatTuple(lang, args, entity, id, key) {
	    try {
	      return format(this, lang, args, entity);
	    } catch (err) {
	      err.id = key ? id + '::' + key : id;
	      err.lang = lang;
	      this._env.emit('resolveerror', err, this);
	      return [{ error: err }, err.id];
	    }
	  };

	  Context.prototype._formatEntity = function _formatEntity(lang, args, entity, id) {
	    var _formatTuple2 = this._formatTuple(lang, args, entity, id);

	    var value = _formatTuple2[1];

	    var formatted = {
	      value: value,
	      attrs: null
	    };

	    if (entity.attrs) {
	      formatted.attrs = Object.create(null);
	      for (var key in entity.attrs) {
	        var _formatTuple3 = this._formatTuple(lang, args, entity.attrs[key], id, key);

	        var attrValue = _formatTuple3[1];

	        formatted.attrs[key] = attrValue;
	      }
	    }

	    return formatted;
	  };

	  Context.prototype._formatValue = function _formatValue(lang, args, entity, id) {
	    return this._formatTuple(lang, args, entity, id)[1];
	  };

	  Context.prototype.fetch = function fetch(langs) {
	    if (langs.length === 0) {
	      return Promise.resolve(langs);
	    }

	    var resIds = Array.from(this._env._resLists.get(this));

	    return Promise.all(resIds.map(this._env._getResource.bind(this._env, langs[0]))).then(function () {
	      return langs;
	    });
	  };

	  Context.prototype._resolve = function _resolve(langs, keys, formatter, prevResolved) {
	    var _this = this;

	    var lang = langs[0];

	    if (!lang) {
	      return reportMissing.call(this, keys, formatter, prevResolved);
	    }

	    var hasUnresolved = false;

	    var resolved = keys.map(function (key, i) {
	      if (prevResolved && prevResolved[i] !== undefined) {
	        return prevResolved[i];
	      }

	      var _ref2 = Array.isArray(key) ? key : [key, undefined];

	      var id = _ref2[0];
	      var args = _ref2[1];

	      var entity = _this._getEntity(lang, id);

	      if (entity) {
	        return formatter.call(_this, lang, args, entity, id);
	      }

	      _this._env.emit('notfounderror', new L10nError('"' + id + '"' + ' not found in ' + lang.code, id, lang), _this);
	      hasUnresolved = true;
	    });

	    if (!hasUnresolved) {
	      return resolved;
	    }

	    return this.fetch(langs.slice(1)).then(function (nextLangs) {
	      return _this._resolve(nextLangs, keys, formatter, resolved);
	    });
	  };

	  Context.prototype.resolveEntities = function resolveEntities(langs, keys) {
	    var _this2 = this;

	    return this.fetch(langs).then(function (langs) {
	      return _this2._resolve(langs, keys, _this2._formatEntity);
	    });
	  };

	  Context.prototype.resolveValues = function resolveValues(langs, keys) {
	    var _this3 = this;

	    return this.fetch(langs).then(function (langs) {
	      return _this3._resolve(langs, keys, _this3._formatValue);
	    });
	  };

	  Context.prototype._getEntity = function _getEntity(lang, id) {
	    var cache = this._env._resCache;
	    var resIds = Array.from(this._env._resLists.get(this));

	    for (var i = 0, resId = undefined; resId = resIds[i]; i++) {
	      var resource = cache.get(resId + lang.code + lang.src);
	      if (resource instanceof L10nError) {
	        continue;
	      }
	      if (id in resource) {
	        return resource[id];
	      }
	    }
	    return undefined;
	  };

	  Context.prototype._getNumberFormatter = function _getNumberFormatter(lang) {
	    if (!this._numberFormatters) {
	      this._numberFormatters = new Map();
	    }
	    if (!this._numberFormatters.has(lang)) {
	      var formatter = Intl.NumberFormat(lang, {
	        useGrouping: false
	      });
	      this._numberFormatters.set(lang, formatter);
	      return formatter;
	    }
	    return this._numberFormatters.get(lang);
	  };

	  Context.prototype._getMacro = function _getMacro(lang, id) {
	    switch (id) {
	      case 'plural':
	        return getPluralRule(lang.code);
	      default:
	        return undefined;
	    }
	  };

	  return Context;
	}();

	function reportMissing(keys, formatter, resolved) {
	  var _this4 = this;

	  var missingIds = new Set();

	  keys.forEach(function (key, i) {
	    if (resolved && resolved[i] !== undefined) {
	      return;
	    }
	    var id = Array.isArray(key) ? key[0] : key;
	    missingIds.add(id);
	    resolved[i] = formatter === _this4._formatValue ? id : { value: id, attrs: null };
	  });

	  this._env.emit('notfounderror', new L10nError('"' + Array.from(missingIds).join(', ') + '"' + ' not found in any language', missingIds), this);

	  return resolved;
	}

	function walkEntry(entry, fn) {
	  if (typeof entry === 'string') {
	    return fn(entry);
	  }

	  var newEntry = Object.create(null);

	  if (entry.value) {
	    newEntry.value = walkValue(entry.value, fn);
	  }

	  if (entry.index) {
	    newEntry.index = entry.index;
	  }

	  if (entry.attrs) {
	    newEntry.attrs = Object.create(null);
	    for (var key in entry.attrs) {
	      newEntry.attrs[key] = walkEntry(entry.attrs[key], fn);
	    }
	  }

	  return newEntry;
	}

	function walkValue(value, fn) {
	  if (typeof value === 'string') {
	    return fn(value);
	  }

	  if (value.type) {
	    return value;
	  }

	  var newValue = Array.isArray(value) ? [] : Object.create(null);
	  var keys = Object.keys(value);

	  for (var i = 0, key = undefined; key = keys[i]; i++) {
	    newValue[key] = walkValue(value[key], fn);
	  }

	  return newValue;
	}

	function createGetter(id, name) {
	  var _pseudo = null;

	  return function getPseudo() {
	    if (_pseudo) {
	      return _pseudo;
	    }

	    var reAlphas = /[a-zA-Z]/g;
	    var reVowels = /[aeiouAEIOU]/g;
	    var reWords = /[^\W0-9_]+/g;

	    var reExcluded = /(%[EO]?\w|\{\s*.+?\s*\}|&[#\w]+;|<\s*.+?\s*>)/;

	    var charMaps = {
	      'fr-x-psaccent': 'ȦƁƇḒḖƑƓĦĪĴĶĿḾȠǾƤɊŘŞŦŬṼẆẊẎẐ[\\]^_`ȧƀƈḓḗƒɠħīĵķŀḿƞǿƥɋřşŧŭṽẇẋẏẑ',
	      'ar-x-psbidi': '∀ԐↃpƎɟפHIſӼ˥WNOԀÒᴚS⊥∩ɅＭXʎZ[\\]ᵥ_,ɐqɔpǝɟƃɥıɾʞʅɯuodbɹsʇnʌʍxʎz'
	    };

	    var mods = {
	      'fr-x-psaccent': function (val) {
	        return val.replace(reVowels, function (match) {
	          return match + match.toLowerCase();
	        });
	      },

	      'ar-x-psbidi': function (val) {
	        return val.replace(reWords, function (match) {
	          return '‮' + match + '‬';
	        });
	      }
	    };

	    var replaceChars = function (map, val) {
	      return val.replace(reAlphas, function (match) {
	        return map.charAt(match.charCodeAt(0) - 65);
	      });
	    };

	    var transform = function (val) {
	      return replaceChars(charMaps[id], mods[id](val));
	    };

	    var apply = function (fn, val) {
	      if (!val) {
	        return val;
	      }

	      var parts = val.split(reExcluded);
	      var modified = parts.map(function (part) {
	        if (reExcluded.test(part)) {
	          return part;
	        }
	        return fn(part);
	      });
	      return modified.join('');
	    };

	    return _pseudo = {
	      name: transform(name),
	      process: function (str) {
	        return apply(transform, str);
	      }
	    };
	  };
	}

	var pseudo = Object.defineProperties(Object.create(null), {
	  'fr-x-psaccent': {
	    enumerable: true,
	    get: createGetter('fr-x-psaccent', 'Runtime Accented')
	  },
	  'ar-x-psbidi': {
	    enumerable: true,
	    get: createGetter('ar-x-psbidi', 'Runtime Bidi')
	  }
	});

	function emit(listeners) {
	  var _this5 = this;

	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  var type = args.shift();

	  if (listeners['*']) {
	    listeners['*'].slice().forEach(function (listener) {
	      return listener.apply(_this5, args);
	    });
	  }

	  if (listeners[type]) {
	    listeners[type].slice().forEach(function (listener) {
	      return listener.apply(_this5, args);
	    });
	  }
	}

	function addEventListener(listeners, type, listener) {
	  if (!(type in listeners)) {
	    listeners[type] = [];
	  }
	  listeners[type].push(listener);
	}

	function removeEventListener(listeners, type, listener) {
	  var typeListeners = listeners[type];
	  var pos = typeListeners.indexOf(listener);
	  if (pos === -1) {
	    return;
	  }

	  typeListeners.splice(pos, 1);
	}

	var parsers = {
	  properties: PropertiesParser,
	  l20n: L20nParser
	};

	var Env$1 = function () {
	  function Env$1(defaultLang, fetchResource) {
	    _classCallCheck(this, Env$1);

	    this.defaultLang = defaultLang;
	    this.fetchResource = fetchResource;

	    this._resLists = new Map();
	    this._resCache = new Map();

	    var listeners = {};
	    this.emit = emit.bind(this, listeners);
	    this.addEventListener = addEventListener.bind(this, listeners);
	    this.removeEventListener = removeEventListener.bind(this, listeners);
	  }

	  Env$1.prototype.createContext = function createContext(resIds) {
	    var ctx = new Context(this);
	    this._resLists.set(ctx, new Set(resIds));
	    return ctx;
	  };

	  Env$1.prototype.destroyContext = function destroyContext(ctx) {
	    var _this6 = this;

	    var lists = this._resLists;
	    var resList = lists.get(ctx);

	    lists.delete(ctx);
	    resList.forEach(function (resId) {
	      return deleteIfOrphan(_this6._resCache, lists, resId);
	    });
	  };

	  Env$1.prototype._parse = function _parse(syntax, lang, data) {
	    var _this7 = this;

	    var parser = parsers[syntax];
	    if (!parser) {
	      return data;
	    }

	    var emit = function (type, err) {
	      return _this7.emit(type, amendError(lang, err));
	    };
	    return parser.parse.call(parser, emit, data);
	  };

	  Env$1.prototype._create = function _create(lang, entries) {
	    if (lang.src !== 'pseudo') {
	      return entries;
	    }

	    var pseudoentries = Object.create(null);
	    for (var key in entries) {
	      pseudoentries[key] = walkEntry(entries[key], pseudo[lang.code].process);
	    }
	    return pseudoentries;
	  };

	  Env$1.prototype._getResource = function _getResource(lang, res) {
	    var _this8 = this;

	    var cache = this._resCache;
	    var id = res + lang.code + lang.src;

	    if (cache.has(id)) {
	      return cache.get(id);
	    }

	    var syntax = res.substr(res.lastIndexOf('.') + 1);

	    var saveEntries = function (data) {
	      var entries = _this8._parse(syntax, lang, data);
	      cache.set(id, _this8._create(lang, entries));
	    };

	    var recover = function (err) {
	      err.lang = lang;
	      _this8.emit('fetcherror', err);
	      cache.set(id, err);
	    };

	    var langToFetch = lang.src === 'pseudo' ? { code: this.defaultLang, src: 'app' } : lang;

	    var resource = this.fetchResource(res, langToFetch).then(saveEntries, recover);

	    cache.set(id, resource);

	    return resource;
	  };

	  return Env$1;
	}();

	function deleteIfOrphan(cache, lists, resId) {
	  var isNeeded = Array.from(lists).some(function (_ref3) {
	    var ctx = _ref3[0];
	    var resIds = _ref3[1];
	    return resIds.has(resId);
	  });

	  if (!isNeeded) {
	    cache.forEach(function (val, key) {
	      return key.startsWith(resId) ? cache.delete(key) : null;
	    });
	  }
	}

	function amendError(lang, err) {
	  err.lang = lang;
	  return err;
	}

	exports.fetchResource = fetchResource$1;
	exports.Env = Env$1;

	/*** EXPORTS FROM exports-loader ***/
	exports["FSI"] = FSI = "";
	exports["PDI"] = PDI = "";
	exports["pseudo"] = pseudo;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getL20nApi = getL20nApi;

	var _overlay = __webpack_require__(6);

	var _key = __webpack_require__(4);

	function getL20nApi(documentL20n) {
	  var l20nService = {
	    $lang: null,
	    update: update,
	    changeLanguage: changeLocale,
	    ready: function ready(callback) {
	      if (l20nService.$lang) {
	        return Promise.resolve(l20nService.$lang).then(callback);
	      } else {
	        return documentL20n.ready.then(function (langs) {
	          documentL20n.remote.resolvedLanguages().then(function () {
	            documentL20n.remote.emit('changedLanguage', l20nService.$lang.code);
	          });
	          return l20nService.$lang = langs[0];
	        }).then(callback);
	      }
	    },
	    hasReady: function hasReady() {
	      if (!l20nService.$lang) {
	        console && console.error && console.error('L20n: l20n has not ready!');
	      }
	      return l20nService.$lang;
	    },
	    bindChangeLanguage: function bindChangeLanguage(callback) {
	      documentL20n.remote.interactive.then(function () {
	        documentL20n.remote.on('changedLanguage', callback);
	      });
	    },
	    get: get,
	    getAsync: getAsync,
	    parse: parse,
	    getNS: getNS,
	    getNSAsync: getNSAsync,
	    getAvailableLanguages: function getAvailableLanguages() {
	      return documentL20n.remote.availableLanguages;
	    }
	  };

	  //更新key，对应的标签的文本，现在的做法是通过$rootScope.broadcast广播更新事件
	  //由对应的指令来捕获这个事件
	  function update(id, args, elem) {
	    if (elem) {
	      if (elem.nodeType === Node.COMMENT_NODE) {
	        return;
	      }
	      return l20nService.ready(function (lang) {
	        var ctx = documentL20n.getContext();
	        var entity = ctx._getEntity(lang, id);
	        if (entity) {
	          var translation = ctx._formatEntity(lang, args, entity, id);
	          (0, _overlay.overlayElement)(elem, translation);
	        }
	        return entity;
	      });
	    } else {
	      //对于native，只需要改变attribute
	      if (typeof args === 'string') {
	        var elems = document.querySelectorAll('[' + _key.l20nName.NAME + '="' + id + '"]');
	        for (var i = 0; i < elems.length; i++) {
	          elems[i].setAttribute(_key.l20nName.ATTRIBUTE, args);
	        }
	        return elems;
	      }

	      return l20nService.ready(function (lang) {
	        var ctx = documentL20n.getContext();
	        var entity = ctx._getEntity(lang, id);
	        if (entity) {
	          var translation = ctx._formatEntity(lang, args, entity, id);
	          var _elems = document.querySelectorAll('[' + _key.l20nName.NAME + '="' + id + '"]');
	          for (var _i = 0; _i < _elems.length; _i++) {
	            (0, _overlay.overlayElement)(_elems[_i], translation);
	          }
	        }
	        return entity;
	      });
	    }
	  }

	  //更新语言
	  function changeLocale(lang, entries, version) {
	    var promise = documentL20n.remote.requestLanguages([lang]);
	    var ctx = documentL20n.remote.ctxs.get(documentL20n.remote.id);
	    var resLists = documentL20n.remote.env._resLists;
	    var resSet = resLists.get(ctx);

	    if (entries) {
	      if (window.navigator.languageMessages) {
	        window.navigator.languageMessages[lang] = Object.assign(window.navigator.languageMessages[lang] || {}, entries);
	      } else {
	        window.navigator.languageMessages = {};
	        window.navigator.languageMessages[lang] = entries;
	      }
	      if (!resSet.has('staticResource')) {
	        resSet.add('staticResource');
	      }
	    }
	    // else if(documentL20n.remote.langDir){
	    //   const resId = documentL20n.remote.langDir + '/' + documentL20n.remote.availableLanguages[lang] + '/{locale}.json';
	    //   resSet.add(resId);
	    // }

	    return new Promise(function (resolve, reject) {
	      promise.then(function (langs) {
	        var ctx = documentL20n.getContext();
	        var p = ctx.fetch(langs);
	        p.then(function (nextLangs) {
	          l20nService.$lang = nextLangs[0];
	          documentL20n.remote.emit('changedLanguage', nextLangs[0].code);
	          resolve(nextLangs[0]);
	        }, reject);
	      });
	    });
	  }

	  function parse(entity, args) {
	    if (l20nService.$lang) {
	      var ctx = documentL20n.getContext();
	      return ctx._formatValue(l20nService.$lang, args, entity, 'parseNoId');
	    }
	  }

	  //同步方式：获取id的文本
	  function get(id, args) {
	    if (typeof id === 'string') {
	      return get([id, args], true);
	    } else {
	      var keys = [id];
	      var isSingle = args;
	      if (l20nService.$lang) {
	        var ctx = documentL20n.getContext();
	        var hasUnresolved = false;

	        var resolved = keys.map(function (key, i) {
	          var _ref5 = Array.isArray(key) ? key : [key, undefined];

	          var id = _ref5[0];
	          var args = _ref5[1];

	          var entity = ctx._getEntity(l20nService.$lang, id);
	          if (entity) {
	            return ctx._formatValue(l20nService.$lang, args, entity, id);
	          }
	          hasUnresolved = true;
	        });
	        if (!hasUnresolved) {
	          return isSingle ? resolved[0] : resolved;
	        } else {
	          return isSingle ? undefined : [];
	        }
	      } else {
	        return isSingle ? undefined : [];
	      }
	    }
	  }

	  //异步方式：获取id的文本
	  function getAsync(id, args) {
	    if (typeof id === 'string') {
	      return getAsync([id, args], true);
	    } else {
	      var keys = id;
	      var isSingle = args;
	      return l20nService.ready(function (lang) {
	        return documentL20n.method('resolveValues', [lang], [keys]);
	      }).then(function (resolved) {
	        return isSingle ? resolved[0] : resolved;
	      });
	    }
	  }

	  //获取多个key，蜂窝式的key
	  //比如：
	  //a.b=xx
	  //a.c=xx
	  //getNS('a')获取的结果就是{a.b: xx, a.c: xx};
	  function getNS(key, args, paralle) {
	    if (l20nService.$lang) {

	      var ctx = documentL20n.getContext();
	      var entities = ctx._env.parser.parseEntityNS(key);

	      var keys = Object.keys(entities);
	      if (paralle) {
	        return getNSValue(ctx, l20nService.$lang, keys, args);
	      } else {
	        return getNSJson(ctx, l20nService.$lang, keys, args);
	      }
	    } else {
	      return paralle ? [] : {};
	    }
	  }
	  //异步方式获取
	  function getNSAsync(key, args, paralle) {
	    return l20nService.ready(function (lang) {

	      var ctx = documentL20n.getContext();
	      var entities = ctx._env.parser.parseEntityNS(key);
	      var keys = Object.keys(entities);
	      if (paralle) {
	        return getNSValue(ctx, lang, keys, args);
	      } else {
	        return getNSJson(ctx, lang, keys, args);
	      }
	    });
	  }

	  function getNSValue(ctx, lang, keys, args) {
	    var hasUnresolved = false;
	    var resolved = keys.map(function (id, i) {
	      var entity = ctx._getEntity(lang, id);
	      if (entity) {
	        return ctx._formatValue(lang, args, entity, id);
	      }
	      hasUnresolved = true;
	    });
	    if (!hasUnresolved) {
	      return resolved;
	    } else {
	      return [];
	    }
	  }

	  function getNSJson(ctx, lang, keys, args) {
	    var hasUnresolved = false;
	    var resolved = {};
	    keys.forEach(function (id) {
	      var entity = ctx._getEntity(lang, id);
	      if (entity) {
	        resolved[id] = ctx._formatValue(lang, args, entity, id);
	      } else {
	        resolved[id] = entity;
	        hasUnresolved = true;
	      }
	    });
	    return resolved;
	  }

	  return l20nService;
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Remote = undefined;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.getAdditionalLanguages = getAdditionalLanguages;

	var _bridge = __webpack_require__(1);

	var _shims = __webpack_require__(3);

	var _langs = __webpack_require__(2);

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Remote = exports.Remote = function () {
	  function Remote(fetchResource, broadcast, requestedLangs) {
	    var _this = this;

	    _classCallCheck(this, Remote);

	    //new! 是为了做缓存
	    this.id = this;
	    this.fetchResource = fetchResource;
	    this.broadcast = broadcast;
	    this.ctxs = new Map();
	    this.interactive = (0, _shims.documentReady)().then(function () {
	      return _this.init(requestedLangs);
	    });
	  }

	  _createClass(Remote, [{
	    key: 'init',
	    value: function init(requestedLangs) {
	      var _this2 = this;

	      var meta = (0, _langs.getMeta)(document.head);
	      this.defaultLanguage = meta.defaultLang;
	      this.availableLanguages = meta.availableLangs;
	      this.appVersion = meta.appVersion;
	      this.langDir = meta.langDir;

	      this.hasLang = !window.navigator.noLang;
	      if (!meta.defaultLang) {
	        this.hasLang = false;
	        this.defaultLanguage = 'zh-CN';
	        this.appVersion = 1;
	        this.availableLanguages = _defineProperty({}, this.defaultLanguage, this.appVersion);
	      }

	      this.env = new _bridge.Env(this.defaultLanguage, function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        return _this2.fetchResource.apply(_this2, [_this2.appVersion].concat(args));
	      });
	      //新添的3个事件绑定的方法，实际走的是env
	      this.emit = this.env.emit;
	      this.on = this.env.addEventListener;
	      this.off = this.env.removeEventListener;

	      return this.requestLanguages(requestedLangs);
	    }
	  }, {
	    key: 'registerView',
	    value: function registerView(viewRemoteId, resources) {
	      var _this3 = this;

	      return this.interactive.then(function () {
	        if (_this3.langDir) {
	          resources.push(_this3.langDir + '/{locale}.json');
	        }

	        _this3.ctxs.set(viewRemoteId, _this3.env.createContext(resources));
	        return true;
	      });
	    }
	  }, {
	    key: 'unregisterView',
	    value: function unregisterView(viewRemoteId) {
	      return this.ctxs.delete(viewRemoteId);
	    }
	  }, {
	    key: 'resolveEntities',
	    value: function resolveEntities(viewRemoteId, langs, keys) {
	      return this.ctxs.get(viewRemoteId).resolveEntities(langs, keys);
	    }
	  }, {
	    key: 'formatValues',
	    value: function formatValues(viewRemoteId, keys) {
	      var _this4 = this;

	      return this.languages.then(function (langs) {
	        return _this4.ctxs.get(viewRemoteId).resolveValues(langs, keys);
	      });
	    }
	  }, {
	    key: 'resolvedLanguages',
	    value: function resolvedLanguages() {
	      return this.languages;
	    }
	  }, {
	    key: 'requestLanguages',
	    value: function requestLanguages(requestedLangs) {
	      return changeLanguages.call(this, getAdditionalLanguages(), requestedLangs);
	    }
	  }, {
	    key: 'getName',
	    value: function getName(code) {
	      return _bridge.pseudo[code].name;
	    }
	  }, {
	    key: 'processString',
	    value: function processString(code, str) {
	      return _bridge.pseudo[code].process(str);
	    }
	  }, {
	    key: 'handleEvent',
	    value: function handleEvent(evt) {
	      return changeLanguages.call(this, evt.detail || getAdditionalLanguages(), navigator.languages);
	    }
	  }]);

	  return Remote;
	}();

	function getAdditionalLanguages() {
	  if (navigator.mozApps && navigator.mozApps.getAdditionalLanguages) {
	    return navigator.mozApps.getAdditionalLanguages().catch(function () {
	      return [];
	    });
	  }

	  return Promise.resolve([]);
	}

	function changeLanguages(additionalLangs, requestedLangs) {
	  var _this5 = this;

	  var prevLangs = this.languages || [];
	  return this.languages = Promise.all([additionalLangs, prevLangs]).then(function (_ref) {
	    var _ref2 = _slicedToArray(_ref, 2),
	        additionalLangs = _ref2[0],
	        prevLangs = _ref2[1];

	    return (0, _langs.negotiateLanguages)(_this5.broadcast.bind(_this5, 'translateDocument'), _this5.appVersion, _this5.defaultLanguage, _this5.availableLanguages, additionalLangs, prevLangs, requestedLangs);
	  });
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * 所有的client实际上是remote, View内部主要是通过remote来更新l20n，所有的client改成了remote，同时，client.method(xxx)都改成了remote.xxx
	 * 不过View本身会提供一些有用的方法
	 */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.View = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	// !add: l20n的属性名通过../key.js来设定


	exports.translateDocument = translateDocument;

	var _shims = __webpack_require__(3);

	var _key2 = __webpack_require__(4);

	var _langs = __webpack_require__(2);

	var _dom = __webpack_require__(5);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var observerConfig = {
	  attributes: true,
	  characterData: false,
	  childList: true,
	  subtree: true,
	  attributeFilter: [_key2.l20nName.NAME, _key2.l20nName.ATTRIBUTE]
	};

	var readiness = new WeakMap();

	var View = exports.View = function () {
	  function View(remote, doc) {
	    var _this = this;

	    _classCallCheck(this, View);

	    this._doc = doc;
	    this.pseudo = {
	      'fr-x-psaccent': createPseudo(this, 'fr-x-psaccent'),
	      'ar-x-psbidi': createPseudo(this, 'ar-x-psbidi')
	    };
	    this._interactive = (0, _shims.documentReady)().then(function () {
	      //此时remote的env才初始化
	      remote.on('translateDocument', translateView);
	      return init(_this, remote);
	    });
	    //https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
	    var observer = new MutationObserver(onMutations.bind(this));
	    this._observe = function () {
	      if (remote.hasLang) {
	        observer.observe(doc, observerConfig);
	      }
	    };
	    this._disconnect = function () {
	      return observer.disconnect();
	    };

	    var translateView = function translateView(langs) {
	      return translateDocument(_this, langs);
	    };
	    //此时remote的env还没有初始化
	    // remote.on('translateDocument', translateView);
	    this.ready = this._interactive.then(function (remote) {
	      return remote.resolvedLanguages();
	    }).then(translateView);
	  }

	  _createClass(View, [{
	    key: 'requestLanguages',
	    value: function requestLanguages(langs, global) {
	      return this._interactive.then(function (remote) {
	        return remote.requestLanguages(langs, global);
	      });
	    }
	  }, {
	    key: '_resolveEntities',
	    value: function _resolveEntities(langs, keys) {
	      return this._interactive.then(function (remote) {
	        return remote.resolveEntities(remote.id, langs, keys);
	      });
	    }
	  }, {
	    key: 'formatValue',
	    value: function formatValue(id, args) {
	      return this._interactive.then(function (remote) {
	        return remote.formatValues(remote.id, [[id, args]]);
	      }).then(function (values) {
	        return values[0];
	      });
	    }
	  }, {
	    key: 'formatValues',
	    value: function formatValues() {
	      for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
	        keys[_key] = arguments[_key];
	      }

	      return this._interactive.then(function (remote) {
	        return remote.formatValues(remote.id, keys);
	      });
	    }
	  }, {
	    key: 'translateFragment',
	    value: function translateFragment(frag) {
	      var _this2 = this;

	      return this._interactive.then(function (remote) {
	        return remote.resolvedLanguages();
	      }).then(function (langs) {
	        return (0, _dom.translateFragment)(_this2, langs, frag);
	      });
	    }
	  }]);

	  return View;
	}();

	View.prototype.setAttributes = _dom.setAttributes;
	View.prototype.getAttributes = _dom.getAttributes;

	function createPseudo(view, code) {
	  return {
	    getName: function getName() {
	      return view._interactive.then(function (remote) {
	        return remote.getName(code);
	      });
	    },
	    processString: function processString(str) {
	      return view._interactive.then(function (remote) {
	        return remote.processString(code, str);
	      });
	    }
	  };
	}

	function init(view, remote) {
	  view._observe();
	  view.availableLanguages = remote.availableLanguages;
	  return remote.registerView(remote.id, (0, _langs.getResourceLinks)(view._doc.head, remote.defaultLanguage)).then(function () {
	    return remote;
	  });
	}

	function onMutations(mutations) {
	  var _this3 = this;

	  return this._interactive.then(function (remote) {
	    return remote.resolvedLanguages();
	  }).then(function (langs) {
	    return (0, _dom.translateMutations)(_this3, langs, mutations);
	  });
	}

	function translateDocument(view, langs) {
	  var html = view._doc.documentElement;

	  if (readiness.has(html)) {
	    return (0, _dom.translateFragment)(view, langs, html).then(function () {
	      return setAllAndEmit(html, langs);
	    });
	  }

	  var translated =
	  // has the document been already pre-translated?
	  langs[0].code === html.getAttribute('lang') ? Promise.resolve() : (0, _dom.translateFragment)(view, langs, html).then(function () {
	    return setLangDir(html, langs);
	  });

	  return translated.then(function () {
	    setLangs(html, langs);
	    readiness.set(html, true);
	    //new! 返回langs
	    return langs;
	  });
	}

	function setLangs(html, langs) {
	  var codes = langs.map(function (lang) {
	    return lang.code;
	  });
	  html.setAttribute('langs', codes.join(' '));
	}

	function setLangDir(html, langs) {
	  var code = langs[0].code;
	  html.setAttribute('lang', code);
	  html.setAttribute('dir', (0, _shims.getDirection)(code));
	}

	function setAllAndEmit(html, langs) {
	  setLangDir(html, langs);
	  setLangs(html, langs);
	  html.parentNode.dispatchEvent(new CustomEvent('DOMRetranslated', {
	    bubbles: false,
	    cancelable: false
	  }));
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var MAX_PLACEABLES = 100;
	var ATTRIBUTE_SEPARATOR = ':';

	var JsonParser = {
	  patterns: null,
	  entryIds: null,
	  emit: null,

	  init: function init() {
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

	  parse: function parse(emit, JsonData) {
	    if (!this.patterns) {
	      this.init();
	      this.JsonData = JsonData;
	    }
	    this.emit = emit;

	    var entries = {};

	    for (var k in JsonData) {
	      this.parseEntity(k, JsonData[k], entries);
	    }
	    return entries;
	  },

	  parseEntityNS: function parseEntityNS(id) {
	    var entries = {};
	    var JsonData = this.JsonData;
	    for (var k in JsonData) {
	      if (k.substr(0, id.length + 1) === id + '.' || k === id) {
	        this.parseEntity(k, JsonData[k], entries);
	      }
	    }
	    return entries;
	  },

	  parseEntity: function parseEntity(id, value, entries) {
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

	  setEntityValue: function setEntityValue(id, attr, key, rawValue, entries) {
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

	  parseString: function parseString(str) {
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

	  unescapeString: function unescapeString(str) {
	    if (str.lastIndexOf('\\') !== -1) {
	      str = str.replace(this.patterns.controlChars, '$1');
	    }
	    return str.replace(this.patterns.unicode, function (match, token) {
	      return String.fromCodePoint(parseInt(token, 16));
	    });
	  },

	  parseIndex: function parseIndex(str) {
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

	  error: function error(msg) {
	    var type = arguments.length <= 1 || arguments[1] === undefined ? 'parsererror' : arguments[1];

	    var err = new L10nError(msg);
	    if (this.emit) {
	      this.emit(type, err);
	    }
	    return err;
	  }
	};

	exports.JsonParser = JsonParser;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.l20nContext = l20nContext;

	var _langs = __webpack_require__(2);

	var _translateDocument = __webpack_require__(13);

	var _view = __webpack_require__(10);

	var _api = __webpack_require__(8);

	function l20nContext(remote, isObservable) {
	  var l20nCxt = {
	    remote: remote,
	    getContext: function getContext() {
	      return remote.ctxs.get(remote.id);
	    },
	    method: function method(methodName) {
	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      var ctx = remote.ctxs.get(remote.id);
	      return ctx[methodName].apply(ctx, args);
	    },
	    ready: null
	  };
	  var documentL20n = document.l20n;

	  if (isObservable) {
	    var view = new _view.View(remote, document);
	    l20nCxt.ready = view.ready;
	  } else {
	    l20nCxt.ready = remote.interactive.then(function () {
	      return remote.registerView(remote.id, (0, _langs.getResourceLinks)(document.head, remote.defaultLanguage)).then(function () {
	        return remote.resolvedLanguages();
	      }).then(function (langs) {
	        return remote.ctxs.get(remote.id).fetch(langs);
	      });
	    });
	  }

	  return (0, _api.getL20nApi)(l20nCxt);
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.translateDocument = translateDocument;

	var _dom = __webpack_require__(5);

	var _shims = __webpack_require__(3);

	//缓存
	var readiness = new WeakMap();

	function translateDocument(langs, remote) {

	  var html = document.documentElement;
	  //是否有缓存
	  if (readiness.has(html)) {
	    return (0, _dom.getFragmentTranslation)(remote, langs, html).then(function () {
	      return setAllAndEmit(html, langs);
	    });
	  }
	  //否则开始搞
	  var translated =
	  // has the document been already pre-translated?
	  langs[0].code === html.getAttribute('lang') ? Promise.resolve() : (0, _dom.getFragmentTranslation)(remote, langs, html).then(function () {
	    return setLangDir(html, langs);
	  });

	  return translated.then(function () {
	    setLangs(html, langs);
	    readiness.set(html, true);
	    return langs;
	  });
	}

	//更新document上面的lang属性，改为当前语言
	function setLangs(html, langs) {
	  var codes = langs.map(function (lang) {
	    return lang.code;
	  });
	  html.setAttribute('langs', codes.join(' '));
	}

	function setLangDir(html, langs) {
	  var code = langs[0].code;
	  html.setAttribute('lang', code);
	  html.setAttribute('dir', (0, _shims.getDirection)(code));
	}

	function setAllAndEmit(html, langs) {
	  setLangDir(html, langs);
	  setLangs(html, langs);
	  html.parentNode.dispatchEvent(new CustomEvent('DOMRetranslated', {
	    bubbles: false,
	    cancelable: false
	  }));
	}

/***/ }
/******/ ])
});
;