import * as React from 'react';
import { Component, PureComponent, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  Divider,
  Form,
  List,
  Label,
  CheckboxProps,
  ListItemProps,
  InputProps,
  TransitionablePortal,
  FormProps,
} from 'semantic-ui-react';
// import * as uuid from 'uuid/v1';

// import { CodeDatabase, Code } from 'services/storage';
// import { State } from 'reducer';
// import { CreateAction, JoinStartAction } from 'actions';
import { noop, useValue } from '../utils';
// import { LANGUAGE } from '../../config';

// const EMPTY = 'empty';

// type StoredListProps = {
//   selected: string;
//   db: CodeDatabase;
//   onSelect: (id: string) => void;
// };

// type StoredListState = {
//   list: Code[];
// };

// class StoredList extends PureComponent<StoredListProps, StoredListState> {
//   state: StoredListState = {
//     list: [],
//   };

//   async getAllList() {
//     const { db } = this.props;
//     const list = await db.getIndexList();
//     this.setState({
//       list,
//     });
//   }

//   onClick = (_event: React.MouseEvent<HTMLAnchorElement>, { id }: ListItemProps) => {
//     this.props.onSelect(id);
//   };

//   componentDidMount() {
//     this.getAllList();
//   }

//   render() {
//     const { selected } = this.props;
//     const { list } = this.state;

//     return (
//       <List divided selection>
//         <List.Item key={EMPTY} active={selected === EMPTY} id={EMPTY} onClick={this.onClick}>
//           <Label color={LANGUAGE.COLOR['javascript']}>{LANGUAGE.DISPLAY['javascript']}</Label>A New One
//         </List.Item>
//         {list.map(({ id, name, language }) => (
//           <List.Item key={id} active={selected === id} id={id} onClick={this.onClick}>
//             <Label color={LANGUAGE.COLOR[language]}>{LANGUAGE.DISPLAY[language]}</Label>
//             {name}
//           </List.Item>
//         ))}
//       </List>
//     );
//   }
// }

type IndexModalProps = {
  open?: boolean;
  // db: CodeDatabase;
  loading?: boolean;
  defaultUserName?: string;
  onCreate(userName: string, codeId: string, codeName: string, content?: string): void;
  onJoin(userName: string, hostId: string): void;
};

// type IndexModalState = {
//   type: 'create' | 'join';
//   userName: string;
//   codeName: string;
//   sharedId: string;
//   selected: string;
//   copy: boolean;
//   errors: string[];
// };



const IndexModal: React.FunctionComponent<IndexModalProps> = ({ open, loading }) => {
  const [type, setType] = useState<'join' | 'create'>('join');
  const onTypeChange = useCallback((_event: React.FormEvent<HTMLInputElement>, { name }: CheckboxProps) => {
    if (!name) {
      return;
    }
    setType(name as 'join' | 'create');
  }, [setType]);
  const [userName, onUserNameChange] = useValue('');
  const [codeName, onCodeNameChange] = useValue('');
  const [sharedId, onSharedIdChange] = useValue('');
  const [copy, setCopy] = useState<boolean>(false);
  const onCopyChange=  useCallback((_event: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
    setCopy(!!checked);
  }, [setCopy])

  const onSubmit = useCallback(() => {

  }, []);

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
              <Form.Input
                required
                label="Name of your great work"
                value={codeName}
                onChange={onCodeNameChange}
              />
            )}
            {type === 'join' && (
              <Form.Input required label="Shared ID" value={sharedId} onChange={onSharedIdChange} />
            )}
            {/* {type === 'create' && selected !== EMPTY && (
              <Form.Checkbox label="Copy" checked={copy} onChange={this.onCopyChange} />
            )} */}
            <Form.Button primary loading={loading}>
              Go
            </Form.Button>
          </Form>
          <Divider vertical />
          {/* <StoredList db={db} selected={selected} onSelect={this.onSelect} /> */}
        </Modal.Content>
      </Modal>
    </TransitionablePortal>
  );
}

export default IndexModal;

// export class IndexModal extends Component<IndexModalProps, IndexModalState> {
//   state: IndexModalState = {
//     type: 'join',
//     userName: this.props.defaultUserName || '',
//     codeName: '',
//     sharedId: '',
//     selected: EMPTY,
//     copy: false,
//     errors: [],
//   };

//   async create() {
//     const { onCreate, db } = this.props;
//     const { type, userName, codeName, selected, copy } = this.state;
//     if (type !== 'create' || !userName || !codeName) {
//       return;
//     }
//     if (selected === EMPTY) {
//       onCreate(userName, uuid(), codeName, '');
//     } else if (selected !== EMPTY) {
//       const from = (await db.code
//         .where('id')
//         .equals(selected)
//         .toArray())[0];
//       if (!from) {
//         throw new Error();
//       }
//       onCreate(userName, copy ? uuid() : from.id, codeName, from.content);
//     }
//   }

//   async join() {
//     const { onJoin } = this.props;
//     const { type, userName, sharedId } = this.state;
//     if (type !== 'join' || !userName || !sharedId) {
//       return;
//     }
//     onJoin(userName, sharedId);
//   }

//   onSubmit = async (e: React.FormEvent<HTMLFormElement>, _data: FormProps) => {
//     const { type } = this.state;
//     e.preventDefault();
//     if (type === 'create') {
//       this.create();
//     } else if (type === 'join') {
//       this.join();
//     }
//   };

//   onTypeChange = (_event: React.FormEvent<HTMLInputElement>, { name }: CheckboxProps) => {
//     this.setState({
//       type: (name || 'join') as 'join' | 'create',
//     });
//   };

//   onUserNameChange = (_event: React.FormEvent<HTMLInputElement>, { value }: InputProps) => {
//     this.setState({
//       userName: value,
//     });
//   };

//   onCodeNameChange = (_event: React.FormEvent<HTMLInputElement>, { value }: InputProps) => {
//     this.setState({
//       codeName: value,
//     });
//   };

//   onSharedIdChange = (_event: React.FormEvent<HTMLInputElement>, { value }: InputProps) => {
//     this.setState({
//       sharedId: value,
//     });
//   };

//   onSelect = (id: string) => {
//     this.setState({
//       selected: id,
//     });
//   };

//   onCopyChange = (_event: React.FormEvent<HTMLInputElement>, { checked }: CheckboxProps) => {
//     this.setState({
//       copy: !!checked,
//     });
//   };

//   static getDerivedStateFromProps(
//     { defaultUserName }: IndexModalProps,
//     { userName }: IndexModalState,
//   ): Partial<IndexModalState> {
//     return {
//       userName: userName || defaultUserName,
//     };
//   }

//   render() {
//     const { type, userName, codeName, sharedId, selected, copy } = this.state;
//     const { db, open, loading } = this.props;

//     return (
//       <TransitionablePortal transition={{ animation: 'fade down' }} open={open} onClose={noop}>
//         <Modal className="index-modal" size="large" open={open} onClose={noop}>
//           <Modal.Content>
//             <Form onSubmit={this.onSubmit}>
//               <Form.Group>
//                 <Form.Radio
//                   name="join"
//                   label="Join someone's great work"
//                   checked={type === 'join'}
//                   onChange={this.onTypeChange}
//                 />
//                 <Form.Radio
//                   name="create"
//                   label="Create your own great work"
//                   checked={type === 'create'}
//                   onChange={this.onTypeChange}
//                 />
//               </Form.Group>
//               <Form.Input required label="Who are you ?" value={userName} onChange={this.onUserNameChange} />
//               {type === 'create' && (
//                 <Form.Input
//                   required
//                   label="Name of your great work"
//                   value={codeName}
//                   onChange={this.onCodeNameChange}
//                 />
//               )}
//               {type === 'join' && (
//                 <Form.Input required label="Shared ID" value={sharedId} onChange={this.onSharedIdChange} />
//               )}
//               {type === 'create' && selected !== EMPTY && (
//                 <Form.Checkbox label="Copy" checked={copy} onChange={this.onCopyChange} />
//               )}
//               <Form.Button primary loading={loading}>
//                 Go
//               </Form.Button>
//             </Form>
//             <Divider vertical />
//             <StoredList db={db} selected={selected} onSelect={this.onSelect} />
//           </Modal.Content>
//         </Modal>
//       </TransitionablePortal>
//     );
//   }
// }

// export default connect(
//   (state: State) => ({
//     open: !state.codeId,
//     loading: state.clientType === 'guest' && !state.codeId,
//     defaultUserName: state.userName,
//   }),
//   {
//     onCreate(userName: string, codeId: string, codeName: string, content = ''): CreateAction {
//       return {
//         type: 'CREATE',
//         userName,
//         codeId,
//         codeName,
//         content,
//       };
//     },
//     onJoin(userName: string, sharedId: string): JoinStartAction {
//       return {
//         type: 'JOIN_START',
//         userName,
//         hostId: sharedId,
//       };
//     },
//   },
// )(IndexModal);
