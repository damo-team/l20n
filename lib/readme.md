# 创建l20n国际化

该目录l20n.js的bindings/html代码以及lib/intl.js，对于l20n的源码，可以分成几个部分：

1. 源码的开发环境，分有node版本，纯web版本，gaia(firefox os原生native)版本等。这在l20n代码release时会自动打包到各个环境目录下。
2. 对于web版本和gaia版本，打包的js代码都分成2个部分：l20n-common.js和l20n.js。l20n.js加入了document的绑定和加载语言的处理。而l20n-common更加纯粹，只提供了调用的高级接口（通过高级接口，你仍可以去请求语言文件和解析等）

对naza-l20n来说，要能够适应3种场景：

1. 纯js的版本，用bingding/html来实现 + l20n-common.js来实现，为啥不直接用l20n.js呢，目前代码中的data-l10n-id需要统一为data-l20n，此外还有一些细节要改动。（当然如果要考虑兼容性，需要使用gaia版本，暂时不考虑）
2. angular的版本，angular已经很好的控制标签属性的变更了，通过指令可以处理整个标签的各种变化监控。这和l20n/bindings/html的代码有冗余，因为这个用到MutationObserver来监控标签的各种变更。所以要开发angular版本，只需要用到l20n-common.js，然后再手动封装angular-directive即可。
3. requireJS的版本，也就是AMD模式下调用，l20n的代码要封装成一个requirejs的插件，暂时没做。


> 基于l20n-common.js而不是直接使用l20n.js，有许多问题l20n不能够解决的，这些问题总结为3类：
> + naza-l20n需要提供，`web`,`angular`,`requirejs`3个版本，同时又希望他们的公用主要逻辑的代码。而l20n.js开放的方法太少了，我们希望从这些公用代码中提炼出统一api调用方法。
>   1. 目前120n-bindings/api.js在处理提供api方法调用部分。
>   2. 同时api调用提供同步和异步的调用方式，异步改同步的做法，需要通过调用defer方法范围promise对象，项目的初始化放在promise中进行，即可通过同步方式调用。
> + 对于l20n.js内部已实现监控dom及其attribute的变更，而`angular`版本希望这些监控都交给`指令`来处理，通过`angular`更方便注入和使用。
>   1. 120n-bindings/ng/是封装`angular`指令和服务
>   2. 在首次渲染页面和切换语言时，不走指令，而是统一的translateDocument的方式处理，这样提升渲染效率。
> + `l20n-common.js + l20n-bindings/html/ = l20n.js`但是html/中部分方法还存在一些问题。同时我们需要注入jsonParser，目前l20n.js只能支持原生的`properties`和`l20n`文本描述文件的解析，官方支持的`json`文件实际上是`ctxdata`，是预编译后的json格式的文本描述。
>   1. 通过`exports-loader`，改写`l20n-common.js`中的FSI,PDI变量，解决页面方框空白的问题，同时开放`pseudo`已供调用。
>   2. 重载`Env._parse`，注入JsonParser，用于解析纯`json`的文本描述
>   3. remote类扩展绑定事件`on`和解除事件`off`方法，并加入id属性，用于Map cache
>   4. view类改变remote绑定`translateDocument`事件位置，通过ready方法成功返回当前语言
>   5. overlay开放`getFragmentTranslation`用于一次性渲染Document,而`translateFragment`方法是在MutationObserver的情况下更新Document。
>   6. 提取data-l20n,data-l20n-args名字可配置化
>   7. 变更key带有属性时，由`key.title`形式改为`key:title`，因为key本身可以带`.`，之前是不行的。


