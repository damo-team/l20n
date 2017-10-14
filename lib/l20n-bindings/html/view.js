'use strict';

/**
 * 所有的client实际上是remote, View内部主要是通过remote来更新l20n，所有的client改成了remote，同时，client.method(xxx)都改成了remote.xxx
 * 不过View本身会提供一些有用的方法
 */
import { documentReady, getDirection } from './shims';
// !add: l20n的属性名通过../key.js来设定
import { l20nName } from '../key';
import {getResourceLinks} from './langs';
import {
  setAttributes, getAttributes, translateFragment, translateMutations
} from './dom';
const observerConfig = {
  attributes: true,
  characterData: false,
  childList: true,
  subtree: true,
  attributeFilter: [l20nName.NAME, l20nName.ATTRIBUTE]
};

const readiness = new WeakMap();

export class View {
  constructor(remote, doc) {
    this._doc = doc;
    this.pseudo = {
      'fr-x-psaccent': createPseudo(this, 'fr-x-psaccent'),
      'ar-x-psbidi': createPseudo(this, 'ar-x-psbidi')
    };
    this._interactive = documentReady().then(
      () => {
        //此时remote的env才初始化
        remote.on('translateDocument', translateView);
        return init(this, remote);
      });
    //https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
    const observer = new MutationObserver(onMutations.bind(this));
    this._observe = () => {
      if(remote.hasLang){
        observer.observe(doc, observerConfig);
      }
    }
    this._disconnect = () => observer.disconnect();

    const translateView = langs => translateDocument(this, langs);
    //此时remote的env还没有初始化
    // remote.on('translateDocument', translateView);
    this.ready = this._interactive.then(
      remote => remote.resolvedLanguages()).then(
      translateView);
  }

  requestLanguages(langs, global) {
    return this._interactive.then(
      remote => remote.requestLanguages(langs, global));
  }

  _resolveEntities(langs, keys) {
    return this._interactive.then(
      remote => remote.resolveEntities(remote.id, langs, keys));
  }

  formatValue(id, args) {
    return this._interactive.then(
      remote => remote.formatValues(remote.id, [[id, args]])).then(
      values => values[0]);
  }

  formatValues(...keys) {
    return this._interactive.then(
      remote => remote.formatValues(remote.id, keys));
  }

  translateFragment(frag) {
    return this._interactive.then(
      remote => remote.resolvedLanguages()).then(
      langs => translateFragment(this, langs, frag));
  }
}

View.prototype.setAttributes = setAttributes;
View.prototype.getAttributes = getAttributes;

function createPseudo(view, code) {
  return {
    getName: () => view._interactive.then(
      remote => remote.getName(code)),
    processString: str => view._interactive.then(
      remote => remote.processString(code, str)),
  };
}

function init(view, remote) {
  view._observe();
  view.availableLanguages = remote.availableLanguages;
  return remote.registerView(remote.id, getResourceLinks(view._doc.head, remote.defaultLanguage)).then(
      () => remote);
}

function onMutations(mutations) {
  return this._interactive.then(
    remote => remote.resolvedLanguages()).then(
    langs => translateMutations(this, langs, mutations));
}

export function translateDocument(view, langs) {
  const html = view._doc.documentElement;

  if (readiness.has(html)) {
    return translateFragment(view, langs, html).then(
      () => setAllAndEmit(html, langs));
  }

  const translated =
    // has the document been already pre-translated?
    langs[0].code === html.getAttribute('lang') ?
      Promise.resolve() :
      translateFragment(view, langs, html).then(
        () => setLangDir(html, langs));

  return translated.then(() => {
    setLangs(html, langs);
    readiness.set(html, true);
    //new! 返回langs
    return langs;
  });
}

function setLangs(html, langs) {
  const codes = langs.map(lang => lang.code);
  html.setAttribute('langs', codes.join(' '));
}

function setLangDir(html, langs) {
  const code = langs[0].code;
  html.setAttribute('lang', code);
  html.setAttribute('dir', getDirection(code));
}

function setAllAndEmit(html, langs) {
  setLangDir(html, langs);
  setLangs(html, langs);
  html.parentNode.dispatchEvent(new CustomEvent('DOMRetranslated', {
    bubbles: false,
    cancelable: false,
  }));
}
