import { observable } from 'mobx';
import io from 'socket.io-client';

export default class {
  socket = io()
  @observable language = 'javascript'
  @observable userName: string = null

  constructor() {
    
  }
}
