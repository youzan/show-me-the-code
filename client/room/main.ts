import 'babel-polyfill';
import Vue from 'vue';
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css'

import App from './App';

Vue.use(MuseUI);

(window as any).require.config({ paths: { 'vs': '/static/vs' }});

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
