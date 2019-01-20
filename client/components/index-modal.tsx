import * as React from 'react';
import { useState, useCallback, memo, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  Divider,
  Form,
  List,
  Label,
  CheckboxProps,
  ListItemProps,
  TransitionablePortal,
  InputOnChangeData,
} from 'semantic-ui-react';

import { noop, useValue, uid } from '../utils';
import { State } from '../reducer';
import { JoinStartAction, CreateAction, UserNameChangeAction } from '../actions';
import CodeDatabase, { Code } from '../services/storage';
import { LANGUAGE } from '../../config';

const EMPTY = 'empty';

type IStoredListProps = {
  selected: string;
  db: CodeDatabase;
  onSelect: (id: string) => void;
};

const StoredList = memo<IStoredListProps>(({ selected, db, onSelect }) => {
  const [list, setList] = useState<Code[]>([]);
  const onClick = useCallback(
    (_event: React.MouseEvent<HTMLAnchorElement>, { id }: ListItemProps) => {
      onSelect(id);
    },
    [onSelect],
  );
  useEffect(
    () => {
      db.getIndexList().then(list => {
        setList(list);
      });
    },
    [db],
  );
  return (
    <List divided selection>
      <List.Item key={EMPTY.toString()} active={selected === EMPTY} id={EMPTY} onClick={onClick}>
        <Label color={LANGUAGE.COLOR['javascript']}>{LANGUAGE.DISPLAY['javascript']}</Label>A New One
      </List.Item>
      {list.map(({ id, name, language }) => (
        <List.Item key={id} active={selected === id} id={id} onClick={onClick}>
          <Label color={LANGUAGE.COLOR[language]}>{LANGUAGE.DISPLAY[language]}</Label>
          {name}
        </List.Item>
      ))}
    </List>
  );
});

type IndexModalProps = {
  open?: boolean;
  db: CodeDatabase;
  loading?: boolean;
  userName: string;
  changeUserName(value: string): void;
  onCreate(codeId: string, codeName: string, content?: string): void;
  onJoin(hostId: string): void;
};

const IndexModal: React.FunctionComponent<IndexModalProps> = ({
  open,
  loading,
  userName,
  changeUserName,
  db,
  onCreate,
  onJoin,
}) => {
  const [type, setType] = useState<'join' | 'create'>('join');
  const onTypeChange = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, { name }: CheckboxProps) => {
      if (!name) {
        return;
      }
      setType(name as 'join' | 'create');
    },
    [setType],
  );
  const [selected, onSelect] = useState<string>(EMPTY);
  const [codeName, onCodeNameChange] = useValue('');
  const [sharedId, onSharedIdChange] = useValue('');
  const [copy, setCopy] = useState<boolean>(false);
  const onCopyChange = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
      setCopy(!!checked);
    },
    [setCopy],
  );
  const onUserNameChange = useCallback(
    (_e: React.FormEvent<HTMLElement>, { value }: InputOnChangeData) => {
      changeUserName(value);
    },
    [changeUserName],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      console.log('onSubmit', userName)
      e.preventDefault();
      if (!userName) {
        return;
      }
      if (type === 'create') {
        if (!codeName) {
          return;
        }
        if (selected === EMPTY) {
          onCreate(uid(), codeName, '');
        } else if (selected !== EMPTY) {
          db.code
            .where('id')
            .equals(selected as string)
            .toArray()
            .then(list => list[0])
            .then(from => {
              if (!from) {
                throw new Error();
              }
              onCreate(copy ? uid() : from.id, codeName, from.content);
            });
        }
      } else if (sharedId) {
        onJoin(sharedId);
      }
    },
    [type, selected, onCreate, onJoin, userName],
  );

  return (
    <TransitionablePortal transition={{ animation: 'fade down' }} open={open} onClose={noop}>
      <Modal className="index-modal" size="large" open={open} onClose={noop}>
        <Modal.Content>
          <Form onSubmit={onSubmit}>
            <Form.Group>
              <Form.Radio
                name="join"
                label="Join someone's great work"
                checked={type === 'join'}
                onChange={onTypeChange}
              />
              <Form.Radio
                name="create"
                label="Create your own great work"
                checked={type === 'create'}
                onChange={onTypeChange}
              />
            </Form.Group>
            <Form.Input required label="Who are you ?" value={userName} onChange={onUserNameChange} />
            {type === 'create' && (
              <Form.Input required label="Name of your great work" value={codeName} onChange={onCodeNameChange} />
            )}
            {type === 'join' && <Form.Input required label="Shared ID" value={sharedId} onChange={onSharedIdChange} />}
            {type === 'create' && selected !== EMPTY && (
              <Form.Checkbox label="Copy" checked={copy} onChange={onCopyChange} />
            )}
            <Form.Button primary loading={loading} onClick={onSubmit}>
              Go
            </Form.Button>
          </Form>
          <Divider vertical />
          <StoredList db={db} selected={selected} onSelect={onSelect} />
        </Modal.Content>
      </Modal>
    </TransitionablePortal>
  );
};

export default connect(
  (state: State) => ({
    open: !state.codeId,
    loading: state.clientType === 'guest' && !state.codeId,
    userName: state.userName,
  }),
  {
    onCreate(codeId: string, codeName: string, content = ''): CreateAction {
      return {
        type: 'CREATE',
        codeId,
        codeName,
        content,
      };
    },
    onJoin(sharedId: string): JoinStartAction {
      return {
        type: 'JOIN_START',
        hostId: sharedId,
      };
    },
    changeUserName(userName: string): UserNameChangeAction {
      return {
        type: 'USER_NAME',
        userName,
      };
    },
  },
)(IndexModal);
