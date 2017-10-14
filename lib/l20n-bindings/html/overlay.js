'use strict';

// match the opening angle bracket (<) in HTML tags, and HTML entities like
// &amp;, &#0038;, &#x0026;.
// 用来判断是否是实体转义字符
const reOverlay = /<|&#?\w+;/;

const allowed = {
  elements: [
    'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data',
    'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u',
    'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr'
  ],
  attributes: {
    global: [ 'title', 'aria-label', 'aria-valuetext', 'aria-moz-hint' ],
    a: [ 'download' ],
    area: [ 'download', 'alt' ],
    // value is special-cased in isAttrAllowed
    input: [ 'alt', 'placeholder' ],
    menuitem: [ 'label' ],
    menu: [ 'label' ],
    optgroup: [ 'label' ],
    option: [ 'label' ],
    track: [ 'label' ],
    img: [ 'alt' ],
    textarea: [ 'placeholder' ],
    th: [ 'abbr']
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
export function overlayElement(element, translation) {
  const value = translation.value;

  if (typeof value === 'string') {
    if (!reOverlay.test(value)) {
      element.textContent = value;
    } else {
      // start with an inert template element and move its children into
      // `element` but such that `element`'s own children are not replaced
      const tmpl = element.ownerDocument.createElement('template');
      tmpl.innerHTML = value;
      // overlay the node with the DocumentFragment
      overlay(element, tmpl.content);
    }
  }
  //多级属性其实是用来替换标签上的属性的。
  for (let key in translation.attrs) {
    const attrName = camelCaseToDashed(key);
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
  const result = translationElement.ownerDocument.createDocumentFragment();
  let k, attr;

  // take one node from translationElement at a time and check it against
  // the allowed list or try to match it with a corresponding element
  // in the source
  let childElement;
  while ((childElement = translationElement.childNodes[0])) {
    translationElement.removeChild(childElement);
    //文本节点，则追加
    if (childElement.nodeType === childElement.TEXT_NODE) {
      result.appendChild(childElement);
      continue;
    }

    const index = getIndexOfType(childElement);
    const sourceChild = getNthElementOfType(sourceElement, childElement, index);
    if (sourceChild) {
      // there is a corresponding element in the source, let's use it
      // 嵌套结构，嵌套调用
      overlay(sourceChild, childElement);
      result.appendChild(sourceChild);
      continue;
    }
    //文本中的标签是由白名单判断的，不是白名单中的不可做修改
    if (isElementAllowed(childElement)) {
      const sanitizedChild = childElement.ownerDocument.createElement(
        childElement.nodeName);
      overlay(sanitizedChild, childElement);
      result.appendChild(sanitizedChild);
      continue;
    }

    // otherwise just take this child's textContent
    result.appendChild(
      translationElement.ownerDocument.createTextNode(
        childElement.textContent));
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
    for (k = 0, attr; (attr = translationElement.attributes[k]); k++) {
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
  const attrName = attr.name.toLowerCase();
  const tagName = element.tagName.toLowerCase();
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
    const type = element.type.toLowerCase();
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
  let nthOfType = 0;
  for (let i = 0, child; child = context.children[i]; i++) {
    if (child.nodeType === child.ELEMENT_NODE &&
        child.tagName === element.tagName) {
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
  let index = 0;
  let child;
  while ((child = element.previousElementSibling)) {
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

  return string
    .replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase();
    })
    .replace(/^-/, '');
}

