import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

const documentL20n = require('../../lib/l20n-rc');
require('../lang/zh-CN.properties');

class App extends Component{
  static contextTypes = {
    l20n: PropTypes.object.isRequired
  }

  constructor(props, context){
    super(props);

    const l20n = context.l20n;

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
    
    this.state = {
      numArgs: {
        num: 1
      },
      varArgs: {
        num: 1
      }
    }
  }

  changeLocale(formatArgslang){
    this.context.l20n.changeLanguage(lang);
  }

  render(){
    return (<div>
          <p data-l20n="title" data-l20n-args={this.state.numArgs}>国际化L20n，依赖于react</p>
          <input type="number" onChange={e => {
                this.setState({
                  numArgs: {
                    num: e.target.value
                  }
                });
              }}/>
          <div>
              <a href="#" onClick={e => this.changeLocale('zh-CN')} >{this.context.l20n.defineMessage('中文版本', 'data.chinese')}</a>
              <a href="#" onClick={e => this.changeLocale('en-US')} >{this.context.l20n.defineMessage('英文版本', 'data.english')}</a>
          </div>

          <div data-l20n="overlayed" data-l20n-args={this.state.varArgs}>
              <strong title={` (Attribute: ${this.state.var} ) `}></strong>
              <input type="number" placeholder="测试一下变量替换" onChange={e => {
                this.setState({
                  var: e.target.value,
                  varArgs: {
                    var: e.target.value
                  }
                });
              }}/>
          </div>
      </div>)
  }
}


class Root extends Component {
  render() {
    return (
        <documentL20n.L20nProvider>
          <App />
        </documentL20n.L20nProvider>
    );
  }
}

document.l20n.ready(function(lang){
  ReactDOM.render(<Root/>, document.getElementById('J_page'));
});

