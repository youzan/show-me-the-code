import 'babel-polyfill';
import Vue from 'vue';
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css'

import App from './App';
import './style';

Vue.use(MuseUI)

new Vue({
  el: '#app',
  render: h => h(App)
});
