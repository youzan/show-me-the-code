import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';

import App, { connection } from './app';

(ReactDOM as any)
  .createRoot(document.getElementById('app'))
  .render(<App />, connection.connect.bind(connection));
