import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Dialog } from 'zent';

import ViewModel from './ViewModel';

interface IHeaderProps {
  store: ViewModel
}

@inject('store') @observer
class Header extends Component<IHeaderProps, {}> {
  render() {
    return (
      <div>
        <Dialog visible={true} />
      </div>
    );
  }
}

export default Header as any