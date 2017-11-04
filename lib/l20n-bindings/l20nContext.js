import { getResourceLinks } from './html/langs';
import { translateDocument }  from './translateDocument';
import { View } from './html/view';
import { getL20nApi } from './api';

export function l20nContext(remote, isObservable){
  const l20nCxt = {
    remote: remote,
    getContext: () => remote.ctxs.get(remote.id),
    method: (methodName, ...args) => {
      var ctx = remote.ctxs.get(remote.id);
      return ctx[methodName].apply(ctx, args);
    },
    ready: null
  }
  const documentL20n = document.l20n;

  if(isObservable){
    const view = new View(remote, document);
    l20nCxt.ready = view.ready;
  }else{
    l20nCxt.ready = remote.interactive
      .then(() => {
        return remote.registerView(remote.id, getResourceLinks(document.head, remote.defaultLanguage))
        .then(() => remote.resolvedLanguages())
        .then(langs => {
          return remote.ctxs.get(remote.id).fetch(langs)
        })
      });
  }
  
  return getL20nApi(l20nCxt);
}
