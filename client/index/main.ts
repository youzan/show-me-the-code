import 'babel-polyfill';
import Vue from 'vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';

import '../style';

import App from './App';

// const roomId = sessionStorage.getItem('room');

// if (roomId) {
//   sessionStorage.removeItem('room');
//   window.location.href = `${_global.url.base}/room/${roomId}`;
// }

Vue.use(iView)

new Vue({
  el: '#app',
  render: h => h(App)
});
