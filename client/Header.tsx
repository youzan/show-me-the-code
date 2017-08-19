import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Dialog, Input, Button } from 'zent';

import ViewModel from './ViewModel';

interface IHeaderProps {
  store: ViewModel
}

interface IHeaderState {
  input: string
}

@inject('store') @observer
class Header extends Component<IHeaderProps, IHeaderState> {
  state = {
    input: ''
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      input: e.target.value
    });
  }

  handleClick = () => {
    this.props.store.userNameChange(this.state.input);
  }

  render() {
    const { userName } = this.props.store;
    const { input } = this.state;

    return (
      <div className="header">
        <Dialog
          visible={!userName}
          maskClosable={false}
          closeBtn={false}
          footer={<Button type="primary" onClick={this.handleClick}>确定</Button>} >
          <Input placeholder="请输入您的用户名" value={input} onChange={this.handleChange} />
        </Dialog>
      </div>
    );
  }
}

export default Header as any