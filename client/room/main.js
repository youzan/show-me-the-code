import 'babel-polyfill';
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import VueRx from 'vue-rx';
import io from 'socket.io-client';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import { parse } from 'cookie';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/share';
import '../style';

import App from './App.vue';

const cookie = parse(document.cookie);

if (cookie['CODING_CREATOR_KEY'] && localStorage) {
  const keys = JSON.parse(localStorage.getItem('$CODING_CREATOR_KEY') || '{}');
  keys[_global.id] = cookie['CODING_CREATOR_KEY'];
  localStorage.setItem('$CODING_CREATOR_KEY', JSON.stringify(keys));
}

const socket = io(_global.url.socket, {
  path: `${_global.url.prefix}/socket.io`
});

Vue.use(iView);
Vue.use(VueSocketio, socket);
Vue.use(VueRx, {
  Observable,
  Subscription,
  Subject
});

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
