import * as React from 'react';
import { PureComponent } from 'react';
import { Modal, Divider, Form, List, Label, CheckboxProps, ListItemProps } from 'semantic-ui-react';
import { CodeDatabase, StorageContext, Code } from 'services/storage';
import { LANGUAGE } from '../../config';

const EMPTY = 'empty';

type StoredListProps = {
  selected: string;
  db: CodeDatabase;
  onSelect: (id: string) => void;
};

type StoredListState = {
  list: Code[];
};

class StoredList extends PureComponent<StoredListProps, StoredListState> {
  state: StoredListState = {
    list: [],
  };

  async getAllList() {
    const { db } = this.props;
    const list = await db.getIndexList();
    this.setState({
      list,
    });
  }

  onClick = (event: React.MouseEvent<HTMLAnchorElement>, { id }: ListItemProps) => {
    this.props.onSelect(id);
  };

  componentDidMount() {
    this.getAllList();
  }

  render() {
    const { selected } = this.props;
    const { list } = this.state;

    return (
      <List divided selection>
        <List.Item key={EMPTY} active={selected === EMPTY} id={EMPTY} onClick={this.onClick}>
          <Label color={LANGUAGE.COLOR['javascript']}>{LANGUAGE.DISPLAY['javascript']}</Label>A New One
        </List.Item>
        {list.map(({ id, name, language }) => (
          <List.Item key={id} active={selected === id} id={id} onClick={this.onClick}>
            <Label color={LANGUAGE.COLOR[language]}>{LANGUAGE.DISPLAY[language]}</Label>
            {name}
          </List.Item>
        ))}
      </List>
    );
  }
}

type IndexModalState = {
  type: 'create' | 'join';
  userName: string;
  codeName: string;
  join: string;
  selected: string;
  copy: boolean;
};

export class IndexModal extends PureComponent<{}, IndexModalState> {
  state: IndexModalState = {
    type: 'join',
    userName: '',
    codeName: '',
    join: '',
    selected: EMPTY,
    copy: false,
  };

  onSubmit = (event: React.FormEvent<HTMLFormElement>, data: any) => {
    console.log(event, data);
  };

  onTypeChange = (event: React.FormEvent<HTMLInputElement>, { checked, name }: CheckboxProps) => {
    this.setState({
      type: (name || 'join') as 'join' | 'create',
    });
  };

  onSelect = (id: string) => {
    this.setState({
      selected: id,
    });
  };

  onCopyChange = (event: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    this.setState({
      copy: !!checked,
    });
  };

  render() {
    const { type, userName, codeName, join, selected, copy } = this.state;

    return (
      <Modal className="index-modal" size="large" open>
        <Modal.Content>
          <Form onSubmit={this.onSubmit}>
            <Form.Group>
              <Form.Radio
                name="join"
                label="Join someone's great work"
                checked={type === 'join'}
                onChange={this.onTypeChange}
              />
              <Form.Radio
                name="create"
                label="Create your own great work"
                checked={type === 'create'}
                onChange={this.onTypeChange}
              />
            </Form.Group>
            <Form.Input required label="Who are you ?" />
            {type === 'create' && <Form.Input required label="Name of your great work" />}
            {type === 'join' && <Form.Input required label="Shared ID" />}
            {type === 'create' &&
              selected !== EMPTY && <Form.Checkbox label="Copy" checked={copy} onChange={this.onCopyChange} />}
            <Form.Button primary>Go</Form.Button>
          </Form>
          <Divider vertical />
          <StorageContext.Consumer>
            {db => <StoredList db={db} selected={selected} onSelect={this.onSelect} />}
          </StorageContext.Consumer>
        </Modal.Content>
      </Modal>
    );
  }
}

export default IndexModal;
