import { l20nName } from '../key';
import { overlayElement } from '../html/overlay';

function camelCase(arr){
  let str = arr[0];
  for(let i = 1; i < arr.length; i++){
    str += arr[i][0].toUpperCase() + arr[i].substr(1);
  }
  return str;
}
const name = l20nName.NAME.split('-').pop();
// data-l20n-optios => l20nOptions
const optionName = camelCase(l20nName.OPTIONS.split('-').slice(1));

/**
 * l20nDirective，提供angular指令，其作用是监控data-l20n和data-l20n-options的变化，触发时更新指定标签的文案。
 * 其中data-l20n-options的变化会同步给data-l20n-args，data-l20n-args只能接受Json字符串，而data-l20n和data-l20n-options可以是angular表
 * 
 * 首先设置指令优先级为1，保证足够低
 * 接着通过controller保存第一次设置的值，controller -> parse -> $observe
 * 最后$observe监控data-l20n和data-l20n-options的变化，一旦变化则更新文案
 */
L20nDirective.$inject = ['l20n', '$rootScope'];
export function L20nDirective(l20n, $rootScope) {
  return {
    restrict: 'A',
    priority: 1,
    controller: ['$attrs', function($attrs){
      this.$name = $attrs[name];
      this.$options = $attrs[optionName];
    }],
    require: ['l20n'],
    link: function(scope, element, attrs, ctrls) {
      var l20nCtrl = ctrls[0];
      
      //todo： 有待验证
      // attrs.$observe(name, function (l20nId) {
      //   //当data-l20n发生变化时
      //   if (l20nId && l20nCtrl.$name !== l20nId) {
      //     l20nCtrl.$name = l20nId;
      //     l20n.update(attrs[name], JSON.parse(attrs[optionName] || '{}'), element[0]);
      //   }else if(l20n.hasReady()){
      //     l20n.update(attrs[name], JSON.parse(attrs[optionName] || '{}'), element[0]);
      //   }
      // });
      
      attrs.$observe(optionName, function (options) {
        //当data-l20n-options发生变化时，而且可以为空
        // if (l20nCtrl.$options !== options) {
        //   l20nCtrl.$options = options;
        //   l20n.update(attrs[name], JSON.parse(options || '{}'), element[0]);
        // }
        console.log(options)
        element.attr(l20nName.ATTRIBUTE, options); //同步给data-l20n-args
      });
    }
  };
}
