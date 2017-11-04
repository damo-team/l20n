import { overlayElement } from './html/overlay';
import { l20nName } from './key';

export function getL20nApi(documentL20n){
  const l20nService = {
    $lang: null,
    update: update,
    changeLanguage: changeLocale,
    ready: function(callback){
      if(l20nService.$lang){
        return Promise.resolve(l20nService.$lang).then(callback);
      }else{
        return documentL20n.ready.then(langs => {
          documentL20n.remote.resolvedLanguages().then(() => {
            documentL20n.remote.emit('changedLanguage', l20nService.$lang.code);  
          });
          return l20nService.$lang = langs[0];
        }).then(callback);
      }
    },
    hasReady: function(){
      if(!l20nService.$lang){
        console && console.error && console.error('L20n: l20n has not ready!');
      }
      return l20nService.$lang;
    },
    bindChangeLanguage: function(callback){
      documentL20n.remote.interactive.then(() => {
        documentL20n.remote.on('changedLanguage', callback)
      });
    },
    get: get,
    getAsync: getAsync,
    parse: parse,
    getNS: getNS,
    getNSAsync: getNSAsync,
    getAvailableLanguages: () => {
      return documentL20n.remote.availableLanguages;
    }
  }

  //更新key，对应的标签的文本，现在的做法是通过$rootScope.broadcast广播更新事件
  //由对应的指令来捕获这个事件
  function update(id, args, elem){
    if(elem){
      if (elem.nodeType === Node.COMMENT_NODE) {
        return;
      }
      return l20nService.ready(function(lang){
        const ctx = documentL20n.getContext();
        const entity = ctx._getEntity(lang, id);
        if(entity){
          const translation = ctx._formatEntity(lang, args, entity, id);
          overlayElement(elem, translation);
        }
        return entity;
      });
    }else{
      //对于native，只需要改变attribute
      if(typeof args === 'string'){
        var elems = document.querySelectorAll('[' + l20nName.NAME + '="' + id + '"]');
        for (let i = 0; i < elems.length; i++) {
          elems[i].setAttribute(l20nName.ATTRIBUTE, args);
        }
        return elems;
      }
      
      return l20nService.ready(function(lang) {
        const ctx = documentL20n.getContext();
        const entity = ctx._getEntity(lang, id);
        if(entity){
          const translation = ctx._formatEntity(lang, args, entity, id);
          const elems = document.querySelectorAll('[' + l20nName.NAME + '="' + id + '"]');
          for (let i = 0; i < elems.length; i++) {
            overlayElement(elems[i], translation);
          }
        }
        return entity;
      });
    }
  }

  //更新语言
  function changeLocale(lang, entries, version) {
    const promise = documentL20n.remote.requestLanguages([lang]);
    const ctx = documentL20n.remote.ctxs.get(documentL20n.remote.id);
    const resLists = documentL20n.remote.env._resLists;
    const resSet = resLists.get(ctx);
    
    if(entries){
      if(window.navigator.languageMessages){
        window.navigator.languageMessages[lang] = Object.assign(window.navigator.languageMessages[lang] || {}, entries);
      }else{
        window.navigator.languageMessages = {}
        window.navigator.languageMessages[lang] = entries;
      }
      if(!resSet.has('staticResource')){
        resSet.add('staticResource');
      }
    }
    // else if(documentL20n.remote.langDir){
    //   const resId = documentL20n.remote.langDir + '/' + documentL20n.remote.availableLanguages[lang] + '/{locale}.json';
    //   resSet.add(resId);
    // }
    
    return new Promise((resolve, reject) => {
      promise.then(langs => {
        const ctx = documentL20n.getContext();
        const p = ctx.fetch(langs);
        p.then(nextLangs => {
          l20nService.$lang = nextLangs[0];
          documentL20n.remote.emit('changedLanguage', nextLangs[0].code);
          resolve(nextLangs[0])
        }, reject);
      });
    });
  }

  function parse(entity, args) {
    if(l20nService.$lang){
      const ctx = documentL20n.getContext();
      return ctx._formatValue(l20nService.$lang, args, entity, 'parseNoId');
    }
  }

  //同步方式：获取id的文本
  function get(id, args) {
    if (typeof id === 'string') {
      return get([id, args], true);
    } else {
      const keys = [id];
      const isSingle = args;
      if(l20nService.$lang){
        const ctx = documentL20n.getContext();
        let hasUnresolved = false;
        
        const resolved = keys.map(function (key, i) {
          const _ref5 = Array.isArray(key) ? key : [key, undefined];

          const id = _ref5[0];
          const args = _ref5[1];

          const entity = ctx._getEntity(l20nService.$lang, id);
          if (entity) {
            return ctx._formatValue(l20nService.$lang, args, entity, id);
          }
          hasUnresolved = true;
        });
        if (!hasUnresolved) {
          return isSingle? resolved[0] : resolved;
        }else{
          return isSingle? undefined : [];
        }
      }else{
        return isSingle? undefined : [];
      }
    }
  }

  //异步方式：获取id的文本
  function getAsync(id, args) {
    if (typeof id === 'string') {
      return getAsync([id, args], true);
    } else {
      const keys = id;
      const isSingle = args;
      return l20nService.ready(lang => {
        return documentL20n.method('resolveValues', [lang], [keys])
      })
      .then(resolved => {
        return isSingle? resolved[0] : resolved
      });
    }
  }

  //获取多个key，蜂窝式的key
  //比如：
  //a.b=xx
  //a.c=xx
  //getNS('a')获取的结果就是{a.b: xx, a.c: xx};
  function getNS(key, args, paralle){
    if(l20nService.$lang){
      
      const ctx = documentL20n.getContext();
      const entities = ctx._env.parser.parseEntityNS(key);
      
      const keys = Object.keys(entities);
      if(paralle){
        return getNSValue(ctx, l20nService.$lang, keys, args);
      }else{
        return getNSJson(ctx, l20nService.$lang, keys, args);
      }
    }else{
      return paralle? [] : {};
    }
  }
  //异步方式获取
  function getNSAsync(key, args, paralle){
    return l20nService.ready(function(lang){
      
      const ctx = documentL20n.getContext();
      const entities = ctx._env.parser.parseEntityNS(key);
      const keys = Object.keys(entities);
      if(paralle){
        return getNSValue(ctx, lang, keys, args);
      }else{
        return getNSJson(ctx, lang, keys, args);
      }
    });
  }

  function getNSValue(ctx, lang, keys, args){
    let hasUnresolved = false;
    const resolved = keys.map(function (id, i) {
      const entity = ctx._getEntity(lang, id);
      if (entity) {
        return ctx._formatValue(lang, args, entity, id);
      }
      hasUnresolved = true;
    });
    if (!hasUnresolved) {
      return resolved;
    }else{
      return [];
    }
  }
  
  function getNSJson(ctx, lang, keys, args){
    let hasUnresolved = false;
    let resolved = {};
    keys.forEach(function (id) {
      const entity = ctx._getEntity(lang, id);
      if (entity) {
        resolved[id] = ctx._formatValue(lang, args, entity, id);
      }else{
        resolved[id] = entity;
        hasUnresolved = true;
      }
    });
    return resolved;
  }

  return l20nService;
}
