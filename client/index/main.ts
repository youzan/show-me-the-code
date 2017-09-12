import 'babel-polyfill';
import Vue from 'vue';
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css'

import App from './App';
import './style';

const roomId = sessionStorage.getItem('room');

if (roomId) {
  sessionStorage.removeItem('room');
  window.location.href = `${_global.url.base}/room/${roomId}`;
}

Vue.use(MuseUI)

new Vue({
  el: '#app',
  render: h => h(App)
});
