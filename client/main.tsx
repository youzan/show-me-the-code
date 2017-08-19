import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';

import Header from './Header';
import ViewModel from './ViewModel';

ReactDOM.render(
    <Header />,
    document.getElementById('header')
);
