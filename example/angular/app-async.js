var ngl20n = require('../../lib/l20n-ng');
require('../lang/zh-CN.properties');

angular.module('l20n-test', [ngl20n])
  .run(['$rootScope', 'l20n', function ($rootScope, l20n) {
    //手动更新文案
    l20n.update('title', {
      num: 0
    });
    //手动获取文案
    l20n.getAsync('title', {
      num: 1
    }).then(function(data){
      console.log('getAsync: ');
      console.log(data);
    });
    //手动获取蜂窝文案
    l20n.getNSAsync('data').then(function(data){
      console.log('getNSAsync: ');
      console.log(data);
    });
    //判断语言是否加载成功
    console.log('hasReady: ');
    console.log(l20n.hasReady());
    l20n.ready(function(lang){
      console.log(lang);
      console.log('get: ');
      console.log(l20n.get('title', {num: 1}));
      console.log('getNS: ');
      console.log(l20n.getNS('data'));
    });
    
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