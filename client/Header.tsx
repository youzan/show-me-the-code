import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Dialog, Input, Button, Tabs, Select } from 'zent';

const { TabPanel } = Tabs as any;

import ViewModel from './ViewModel';

const languages = ['TypeScript', 'JavaScript', 'CSS', 'LESS', 'SCSS', 'JSON', 'HTML', 'XML', 'PHP', 'C#', 'C++', 'Razor', 'Markdown', 'Diff', 'Java', 'VB', 'CoffeeScript', 'Handlebars', 'Batch', 'Pug', 'F#', 'Lua', 'Powershell', 'Python', 'SASS','R', 'Objective-C']

interface IHeaderProps {
  store: ViewModel
}

interface IHeaderState {
  input: string
  activeTab: string
  room: string
  key: string
}

@inject('store') @observer
class Header extends Component<IHeaderProps, IHeaderState> {
  state = {
    input: '',
    activeTab: '1',
    room: '',
    key: ''
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      input: e.target.value
    });
  }

  handleRoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      room: e.target.value
    });
  }

  handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      key: e.target.value
    });
  }

  handleClick = () => {
    this.props.store.userNameChange(this.state.input);
  }

  handleTabSwitch = (value: string) => {
    this.setState({
      activeTab: value
    });
  }

  handleJoinRoom = () => {
    this.props.store.joinRoom(this.state.room, this.state.key);
  }

  render() {
    const { userName, room, createRoom, changeLanguage } = this.props.store;
    const { input, activeTab, room: roomValue, key } = this.state;

    return (
      <div className="header">
        <Select data={languages} filter={(item, keyword) => item.indexOf(keyword) > -1} onChange={changeLanguage} />
        <Dialog
          visible={!userName}
          maskClosable={false}
          closeBtn={false}
          footer={<Button type="primary" onClick={this.handleClick}>确定</Button>} >
          <Input placeholder="请输入您的用户名" value={input} onChange={this.handleChange} />
        </Dialog>
        <Dialog
          visible={userName && !room}
          maskClosable={false}
          closeBtn={false} >
          <Tabs
            type="slider"
            activeId={activeTab}
            onTabChange={this.handleTabSwitch}
          >
            <TabPanel
              tab="创建房间"
              id="1"
            >
              <Button type="primary" onClick={createRoom}>创建房间</Button>
            </TabPanel>
            <TabPanel
              tab="加入已有房间"
              id="2"
            >
              <Input addonBefore="ID" value={roomValue} onChange={this.handleRoomChange} />
              <Input addonBefore="KEY" value={key} onChange={this.handleKeyChange} />
              <Button type="primary" onClick={this.handleJoinRoom}>确认</Button>
            </TabPanel>
          </Tabs>
        </Dialog>
      </div>
    );
  }
}

export default Header as any