require('../lang/zh-CN.properties');
var L20n = require('../../lib/l20n-native');
//手动更新文案
L20n.update('title', JSON.stringify({
  num: 1
}));

L20n.ready(function(lang){
  //手动获取文案
  console.log('get: ');
  console.log(L20n.get('title', {num: 1 }));
  //手动获取蜂窝文案
  console.log('getNS: ');
  console.log(L20n.getNS('data'));
  //判断语言是否加载成功
  console.log('hasReady: ');
  console.log(L20n.hasReady());
});


window.changeNum = function(inp){
  L20n.update('title', JSON.stringify({
    num: parseInt(inp.value) || 0
  }));
}

window.changeVar = function(inp){
  L20n.update('overlayed', JSON.stringify({
    'var': parseInt(inp.value) || 0
  }));
}

window.changeLocale = function(lang){
  L20n.changeLanguage(lang);
}
