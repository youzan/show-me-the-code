import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';

import App, { store, connection } from 'app';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
  () => {
    connection.connect();
  }
);
