'use strict';

import { pseudo } from '../bridge';

/**
 * extname = json|properties|l20n
 * <link rel="localization" href="[path]/{locale}.{extname}"/>
 * @param {*} head 
 */
export function getResourceLinks(head, defaultLang) {
  const resIds = Array.prototype.map.call(
    head.querySelectorAll('link[rel="localization"]'),
    el => {
      if(defaultLang){
        return el.getAttribute('href').replace(/\/[\w-_]*(\.\w*)(\?[#a-z0-9=\.]+)?$/, ($0, $1, $2) => {
          return '/{locale}' + $1 + ($2 || '');
        });
      }else{
        return el.getAttribute('href')
      }
    });
  
  if(window.navigator.defaultLanguageMessage){
    window.navigator.languageMessages = window.navigator.languageMessages || {};
    if(!window.navigator.languageMessages[defaultLang]){
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
export function getMeta(head) {
  let availableLangs = Object.create(null);
  let defaultLang = null;
  let appVersion = null;
  let langDir = null;

  // XXX take last found instead of first?
  const metas = head.querySelectorAll(
    'meta[name="availableLanguages"],' +
    'meta[name="defaultLanguage"],' +
    'meta[name="appVersion"],' + 
    'meta[name="langDir"]');
  for (let meta of metas) {
    const name = meta.getAttribute('name');
    const content = meta.getAttribute('content').trim();
    switch (name) {
      case 'availableLanguages':
        availableLangs = getLangRevisionMap(
          availableLangs, content);
        break;
      case 'defaultLanguage':
        const [lang, rev] = getLangRevisionTuple(content);
        defaultLang = lang;
        if (!(lang in availableLangs)) {
          availableLangs[lang] = rev;
        }
        break;
      case 'appVersion':
        appVersion = content;
        break;
      case 'langDir':
        langDir = content
        break;
    }
  }

  return {
    defaultLang,
    availableLangs,
    appVersion,
    langDir
  };
}

function getLangRevisionMap(seq, str) {
  return str.split(',').reduce((seq, cur) => {
    const [lang, rev] = getLangRevisionTuple(cur);
    seq[lang] = rev;
    return seq;
  }, seq);
}

function getLangRevisionTuple(str) {
  const [lang, rev]  = str.trim().split(':');
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
export function negotiateLanguages(
  fn, appVersion, defaultLang, availableLangs, additionalLangs, prevLangs,
  requestedLangs) {

  const allAvailableLangs = Object.keys(availableLangs).concat(
    additionalLangs || []).concat(Object.keys(pseudo));
  const newLangs = prioritizeLocales(
    defaultLang, allAvailableLangs, requestedLangs);

  const langs = newLangs.map(code => ({
    code: code,
    src: getLangSource(appVersion, availableLangs, additionalLangs, code),
  }));

  if (!arrEqual(prevLangs, newLangs)) {
    fn(langs);
  }

  return langs;
}

function arrEqual(arr1, arr2) {
  return arr1.length === arr2.length &&
    arr1.every((elem, i) => elem === arr2[i]);
}

function getMatchingLangpack(appVersion, langpacks) {
  for (let i = 0, langpack; (langpack = langpacks[i]); i++) {
    if (langpack.target === appVersion) {
      return langpack;
    }
  }
  return null;
}

function prioritizeLocales(def, availableLangs, requested) {
  let supportedLocale;
  // Find the first locale in the requested list that is supported.
  for (let i = 0; i < requested.length; i++) {
    const locale = requested[i];
    if (availableLangs.indexOf(locale) !== -1) {
      supportedLocale = locale;
      break;
    }
  }
  if (!supportedLocale ||
      supportedLocale === def) {
    return [def];
  }

  return [supportedLocale, def];
}


// extra是firefox扩展，pseudo应该是firefox os的语言
// 真正我们用到的是app
function getLangSource(appVersion, availableLangs, additionalLangs, code) {
  if (additionalLangs && additionalLangs[code]) {
    const lp = getMatchingLangpack(appVersion, additionalLangs[code]);
    if (lp &&
        (!(code in availableLangs) ||
         parseInt(lp.revision) > availableLangs[code])) {
      return 'extra';
    }
  }

  if ((code in pseudo) && !(code in availableLangs)) {
    return 'pseudo';
  }

  return 'app';
}
