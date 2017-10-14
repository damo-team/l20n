import { getFragmentTranslation } from './html/dom';
import { getDirection } from './html/shims'
//缓存
const readiness = new WeakMap();

export function translateDocument(langs, remote) {
  
  const html = document.documentElement;
  //是否有缓存
  if (readiness.has(html)) {
    return getFragmentTranslation(remote, langs, html).then(
      () => setAllAndEmit(html, langs));
  }
  //否则开始搞
  const translated =
    // has the document been already pre-translated?
    langs[0].code === html.getAttribute('lang') ?
      Promise.resolve() :
      getFragmentTranslation(remote, langs, html).then(
        () => setLangDir(html, langs));

  return translated.then(() => {
    setLangs(html, langs);
    readiness.set(html, true);
    return langs;
  });
  
}

//更新document上面的lang属性，改为当前语言
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

