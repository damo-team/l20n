'use strict';

/**
 * 提供一些接口，用于根据key获取文本描述，然后替换key所在的标签的innerHTML和attribute
 */

import { overlayElement } from './overlay';
// !add: l20n的属性名通过../key.js来设定
import { l20nName } from '../key';

const reHtml = /[&<>]/g;
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

export function setAttributes(element, id, args) {
  element.setAttribute(l20nName.NAME, id);
  if (args) {
    element.setAttribute(l20nName.ATTRIBUTE, JSON.stringify(args));
  }
}

export function getAttributes(element) {
  return {
    id: element.getAttribute(l20nName.NAME),
    args: JSON.parse(element.getAttribute(l20nName.ATTRIBUTE))
  };
}
// <div data-l20n="a"><div data-l20n="b">...</div></div>
// => [
//    div[data-l20n="a"],
//    div[data-l20n="b"],
//    ...
//  ]
function getTranslatables(element) {
  const nodes = Array.from(element.querySelectorAll('[' + l20nName.NAME + ']'));

  if (typeof element.hasAttribute === 'function' &&
      element.hasAttribute(l20nName.NAME)) {
    nodes.push(element);
  }

  return nodes;
}

//mutations是被观察的对象
//more: https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
//mutations.type="attributes", 说明被观察的dom的属性名有变更
//mutations.type="childList", mutation.addedNodes 说明是新添了节点
export function translateMutations(view, langs, mutations) {
  const targets = new Set();

  for (let mutation of mutations) {
    switch (mutation.type) {
      case 'attributes':
        targets.add(mutation.target);
        break;
      case 'childList':
        for (let addedNode of mutation.addedNodes) {
          //nodeType=1时，等同于ELEMENT_NODE, 是属性节点
          //more: http://www.w3school.com.cn/jsref/prop_node_nodetype.asp
          if (addedNode.nodeType === addedNode.ELEMENT_NODE) {
            if (addedNode.childElementCount) {
              getTranslatables(addedNode).forEach(targets.add.bind(targets));
            } else {
              if (addedNode.hasAttribute(l20nName.NAME)) {
                targets.add(addedNode);
              }
            }
          }
        }
        break;
    }
  }

  if (targets.size === 0) {
    return;
  }
  //渲染key所对应的html结构
  translateElements(view, langs, Array.from(targets));
}

export function translateFragment(view, langs, frag) {
  return translateElements(view, langs, getTranslatables(frag));
}
//获取key对应的值和属性
function getElementsTranslation(view, langs, elems) {
  const keys = elems.map(elem => {
    const id = elem.getAttribute(l20nName.NAME);
    const args = elem.getAttribute(l20nName.ATTRIBUTE);
    return args ? [
      id,
      //在args中的文本去除实体转义
      JSON.parse(args.replace(reHtml, match => htmlEntities[match]))
    ] : id;
  });

  return view._resolveEntities(langs, keys);
}

function translateElements(view, langs, elements) {
  return getElementsTranslation(view, langs, elements).then(
    translations => applyTranslations(view, elements, translations));
}
//替换html
function applyTranslations(view, elems, translations) {
  view._disconnect();
  for (let i = 0; i < elems.length; i++) {
    overlayElement(elems[i], translations[i]);
  }
  view._observe();
}

//new！ 开放给l20n-ng
export function getFragmentTranslation(remote, langs, frag) {
  let elems = getTranslatables(frag);
  const keys = elems.map(elem => {
    const id = elem.getAttribute(l20nName.NAME);
    const args = elem.getAttribute(l20nName.ATTRIBUTE);
    return args ? [
      id,
      //在args中的文本去除实体转义
      JSON.parse(args.replace(reHtml, match => htmlEntities[match]))
    ] : id;
  });
  
  return remote.resolveEntities(remote.id, langs, keys).then(
    translations => {
      for (let i = 0; i < elems.length; i++) {
        overlayElement(elems[i], translations[i]);
      }
    }
  )
}
