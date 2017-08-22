import 'babel-polyfill';
import Vue from 'vue';
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css'

import App from './App';

Vue.use(MuseUI);

(window as any).require.config({ paths: { 'vs': '/static/vs' }});

(Vue as any).material.registerTheme('default', {
  primary: {
    color: 'white',
    hue: 900,
    textColor: 'black'
  },
  accent: 'grey',
  warn: 'red',
  background: 'white'
});

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
