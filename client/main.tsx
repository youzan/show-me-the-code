import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';

import App, { store, connection } from './app';

// (ReactDOM as any).createRoot(document.getElementById('app')).render(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   connection.connect.bind(connection),
// );

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
  connection.connect.bind(connection),
);
