'use strict';

import { broadcast, fetchResource } from './l20n-bindings/bridge';
import { Remote } from './l20n-bindings/html/remote';
import { l20nContext } from './l20n-bindings/l20nContext';

/** -------------------
* 1. 获取当前语言
* 2. 初始化Remote
* 3. 监听浏览器语言切换languagechange, additionallanguageschange
* 4. 开放L20nProvider, ng1.x应用中自行加入
* 5. 提供全局对象document.l20n
----------------------*/

let requestLanguages = navigator.languages;
if(window.DEFER_LANGUAGES){
  requestLanguages = window.DEFER_LANGUAGES;
}

const remote = new Remote(fetchResource, broadcast, requestLanguages);

window.addEventListener('languagechange', remote);
document.addEventListener('additionallanguageschange', remote);

document.l20n = l20nContext(remote, true);

export default document.l20n;
