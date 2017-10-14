import hoistNonReactStatics from 'hoist-non-react-statics';

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

export const l20n = (option) =>
  BaseComponent => {
    class NewComponent extends Component {
      constructor(props, context){
        super(props, context);
        this.state = document.l20n.getNS(option.key, option.args);

        this.intl = {
          defineMessage: (obj) => {
            this.setState(obj);
          },
          getMessage: (name) => {
            this.state[name];
          }
        }
        if(!document.l20n.$lang){
          document.l20n.ready(lang => {
            this.setState(document.l20n.getNS(option.key, option.args));
          })
        }
      }

      render() {
        return (<BaseComponent {...this.props} intl={this.intl} intlMessage={this.state} />)
      }
    }
    return hoistNonReactStatics(NewComponent, BaseComponent);
  }
  
l20n.getUpdater = (option) => {
  return {
    value: function(props){
      let messages = document.l20n.getNS(option.key, option.args);
      if(!document.l20n.$lang){
        document.l20n.ready(lang => {
          messages = document.l20n.getNS(option.key, option.args);
          this.stateUpdater.setIntl(getIntl());
        })
      }
      const getIntl = () => {
        return {
          defineMessage: (obj) => {
            Object.assign(messages, obj);
            this.stateUpdater.setIntl(getIntl());
          },
          getMessage: (name) => {
            return messages[name]
          }
        }
      }
      return getIntl();
    },
    setter: 'setIntl'
  }
}
