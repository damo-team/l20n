import React, { Component, PropTypes, Children } from 'react'
import ReactDOM from 'react-dom';
import {l20nShape} from './l20nShape';

const notByDefaultMessage = !window.navigator.defaultLanguageMessage;
if(notByDefaultMessage){
  window.navigator.defaultLanguageMessage = {};
}

export function defineMessage(obj, attribute){
  let id, message = '', plural = '';
  if(Object(obj) === obj){
    id = obj.id;
    message = obj.message;
    if(message){
      plural = obj.plural;
      if(Object(plural) === plural){
        message += plural.state.other;
        plural = JSON.stringify({
          [plural.name]: plural.value
        });
      }else if(Object(obj.props) === obj.props){
        plural = JSON.stringify(obj.props);
      }
      if(notByDefaultMessage){
        window.navigator.defaultLanguageMessage[id] = message;
      }else{
        message = window.navigator.defaultLanguageMessage[id] || message;
      }
      if(obj.pure){
        return document.l20n.get(id, plural) || message;
      }else{
        return (<span data-l20n={id} data-l20n-args={plural}>{message}</span>)
      }
    }else{
      // #! expired
      return id;
    }
  }else{
    // #! expired
    return obj;
  }
}

export function pureMessage(id, message, noPure){
  if(notByDefaultMessage){
    window.navigator.defaultLanguageMessage[id] = message;
  }else{
    message = window.navigator.defaultLanguageMessage[id] || message;
  }
  if(noPure){
    return (<span data-l20n={id} >{message}</span>)
  }else{
    return document.l20n.get(id) || message;
  }
}

export function formatMessage(msg, pure){
  if(React.isValidElement(msg)){
    let props = msg.props['data-l20n-args'];
    if(props){
      try{
        props = JSON.parse(props);
      }catch(e){
        props = {};
      }
    }
    return document.l20n.get(msg.props['data-l20n'], props) || window.navigator.defaultLanguageMessage[msg.props['data-l20n']] || msg.props.children;
  }else if(Object(msg) === msg){
    let plural = msg.plural || '';
    if(Object(plural) === plural){
      plural = JSON.stringify({
        [plural.name]: plural.value
      });
    }else if(Object(msg.props) === msg.props){
      plural = JSON.stringify(msg.props);
    }
    if(msg.pure){
      return document.l20n.get(msg.id, plural) || window.navigator.defaultLanguageMessage[msg.id] || msg.id;
    }else{
      return (<span data-l20n={msg.id} data-l20n-args={plural}>{document.l20n.get(msg.id, plural) || window.navigator.defaultLanguageMessage[msg.id] || msg.id}</span>)
    }
  }else{
    if(pure){
      return msg && document.l20n.get(msg) || window.navigator.defaultLanguageMessage[msg] || msg
    }else{
      return (<span data-l20n={msg}>{document.l20n.get(msg) || window.navigator.defaultLanguageMessage[msg] || msg}</span>)
    }
  }
}
  
export function formatPlural(args){
  return JSON.stringify(args);
}

export class L20nProvider extends Component {
  static displayName = 'L20nProvider';

  static propTypes = {
    children: PropTypes.element.isRequired
  }

  static childContextTypes = {
    l20n: l20nShape.isRequired
  }

  getChildContext() {
    return { l20n: document.l20n }
  }

  constructor(props, context){
    super(props, context);

    this.state = {
      lang: null
    }

    document.l20n.ready((lang) => {
      console && console.log && console.log('L20n: l20n had ready!')
      this.props.onChangeLanguage && this.props.onChangeLanguage(lang.code);
      this.setState({
        lang: lang
      })
      
    });
    
    const changeLanguage = document.l20n.changeLanguage;
    document.l20n.changeLanguage = (lang) => {
      const promise = changeLanguage.call(document.l20n, lang);
      return promise.then(lang => {
        if(lang.src !== 'pseudo'){
          this.props.onChangeLanguage && this.props.onChangeLanguage(lang.code);
          this.setState({
            lang: lang
          });
          return lang;
        }else{
          return null;
        }
      });
    }
    
    document.l20n.defineMessage = defineMessage;
    document.l20n.formatMessage = formatMessage;
    document.l20n.formatPlural = formatPlural;
  }

  render() {
    return Children.only(this.props.children)
  }
}
