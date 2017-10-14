window.name = 'NG_DEFER_BOOTSTRAP!';

window.navigator.languageMessages = {
  'zh-CN': {
    "data.chinese": "中文版本1",
    "data.english": "英文版本1",
    "overlayed": "本次测试 <strong title=\" (Attribute: {{ var }}) \">覆盖元素</strong>。 测试的数字：<input placeholder=\"测试一下变量替换\">.",
    "title": "{[plural(num)]}",
    "title[one]": "才1个对象",
    "title[other]": "才{{num}}个对象",
    "title[two]": "才2个对象",
    "title[zero]": "没有对象"
  }
}

const documentL20n = require('../../lib/l20n-ng');
require('../lang/zh-CN.properties');

angular.module('l20n-test', [])
  .provider('l20n', documentL20n.L20nProvider)
  .directive('l20n', documentL20n.L20nDirective)
  .run(['$rootScope', 'l20n', function ($rootScope, l20n) {
    console.log(l20n.getNS('overlayed'));
    //手动更新文案
    l20n.update('title', {
      num: 0
    });
    //手动获取文案
    console.log('get: ');
    console.log(l20n.get('title', {num: 1 }));
    //手动获取蜂窝文案
    console.log('getNS: ');
    console.log(l20n.getNS('data'));
    //判断语言是否加载成功
    console.log('hasReady: ');
    console.log(l20n.hasReady());
    
    //通过指令初始化
    $rootScope.numArgs = {
      num: 1
    }
    $rootScope.varArgs = {
      'var': 1
    }
    //通过$digest更新指令
    $rootScope.$watch('num', function(newVal, preVal){
      if(newVal != preVal){
        $rootScope.numArgs = {
          num: parseInt(newVal) || 0
        }
      }
    });
    
    $rootScope.$watch('_var', function(newVal, preVal){
      if(newVal != preVal){
        $rootScope.varArgs = {
          'var': parseInt(newVal) || 0
        }
      }
    });
    //切换语言
    $rootScope.changeLocale = function(lang){
      l20n.changeLanguage(lang);
    }
}]);

document.l20n.ready(function(lang){
  angular.resumeBootstrap();
});
