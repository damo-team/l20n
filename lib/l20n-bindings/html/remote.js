'use strict';
import {pseudo, broadcast, Env} from '../bridge';
import {documentReady} from './shims';
import {getMeta, negotiateLanguages} from './langs';

export class Remote {
  constructor(fetchResource, broadcast, requestedLangs) {
    //new! 是为了做缓存
    this.id = this;
    this.fetchResource = fetchResource;
    this.broadcast = broadcast;
    this.ctxs = new Map();
    this.interactive = documentReady().then(() => this.init(requestedLangs));
  }

  init(requestedLangs) {
    const meta = getMeta(document.head);
    this.defaultLanguage = meta.defaultLang;
    this.availableLanguages = meta.availableLangs;
    this.appVersion = meta.appVersion;
    this.langDir = meta.langDir;
    this.extName = meta.extName || '.json';

    this.hasLang = !window.navigator.noLang;
    if (!meta.defaultLang) {
      this.defaultLanguage = 'zh-CN';
      this.appVersion = 1;
      this.availableLanguages = {
        [this.defaultLanguage]: this.appVersion
      };
    }

    this.env = new Env(this.defaultLanguage, (...args) => this.fetchResource(this.appVersion, ...args));
    //新添的3个事件绑定的方法，实际走的是env
    this.emit = this.env.emit;
    this.on = this.env.addEventListener;
    this.off = this.env.removeEventListener;

    return this.requestLanguages(requestedLangs);
  }

  registerView(viewRemoteId, resources) {
    return this
      .interactive
      .then(() => {
        if (this.langDir) {
          resources.push(this.langDir + '/{locale}' + this.extName)
        }

        this
          .ctxs
          .set(viewRemoteId, this.env.createContext(resources));
        return true;
      });
  }

  unregisterView(viewRemoteId) {
    return this
      .ctxs
      .delete(viewRemoteId);
  }

  resolveEntities(viewRemoteId, langs, keys) {
    return this
      .ctxs
      .get(viewRemoteId)
      .resolveEntities(langs, keys);
  }

  formatValues(viewRemoteId, keys) {
    return this
      .languages
      .then(langs => this.ctxs.get(viewRemoteId).resolveValues(langs, keys));
  }

  resolvedLanguages() {
    return this
      .languages
      .then(langs => {
        if (window.navigator.notifer) {
          return window
            .navigator
            .notifer
            .getPromise()
            .then(() => langs);
        } else {
          return langs;
        }
      });
  }

  requestLanguages(requestedLangs) {
    return changeLanguages.call(this, getAdditionalLanguages(), requestedLangs);
  }

  getName(code) {
    return pseudo[code].name;
  }

  processString(code, str) {
    return pseudo[code].process(str);
  }

  handleEvent(evt) {
    return changeLanguages.call(this, evt.detail || getAdditionalLanguages(), navigator.languages);
  }
}

export function getAdditionalLanguages() {
  if (navigator.mozApps && navigator.mozApps.getAdditionalLanguages) {
    return navigator
      .mozApps
      .getAdditionalLanguages()
      .catch(() => []);
  }

  return Promise.resolve([]);
}

function changeLanguages(additionalLangs, requestedLangs) {
  const prevLangs = this.languages || [];
  return this.languages = Promise
    .all([additionalLangs, prevLangs])
    .then(([additionalLangs, prevLangs]) => negotiateLanguages(this.broadcast.bind(this, 'translateDocument'), this.appVersion, this.defaultLanguage, this.availableLanguages, additionalLangs, prevLangs, requestedLangs));
}
