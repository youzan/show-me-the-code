import { OrderedMap, Record } from 'immutable';

import {
  LanguageDidChangeAction,
  FontSizeChangeAction,
  ExecutionAction,
  ExecutionOutputAction,
  ClearAction,
  ConnectedAction,
  CreateAction,
  JoinAction,
  JoinAcceptedAction,
  JoinRejectAction,
} from './actions';

type IState = {
  clientId: string | null;
  codeId: string | '';
  codeName: string | '';
  userName: string;
  hostId: string | null;
  clientType: 'host' | 'guest' | null;
  language: string;
  fontSize: number;
  output: OrderedMap<string, any[][]>;
};

export type State = Record<IState> & Readonly<IState>;

const StateRecord = Record<IState>({
  clientId: null,
  codeId: '',
  codeName: '',
  userName: '',
  hostId: null,
  clientType: null,
  language: 'javascript',
  fontSize: 12,
  output: OrderedMap(),
});

type Action =
  | LanguageDidChangeAction
  | FontSizeChangeAction
  | ExecutionAction
  | ExecutionOutputAction
  | ClearAction
  | ConnectedAction
  | CreateAction
  | JoinAction
  | JoinAcceptedAction
  | JoinRejectAction;

export function reducer(state = StateRecord(), action: Action): State {
  switch (action.type) {
    case 'LANGUAGE_DID_CHANGE':
      return state.set('language', action.language);
    case 'FONT_SIZE_CHANGE':
      return state.set('fontSize', action.fontSize);
    case 'EXECUTION':
      return state.update('output', output => output.set(action.id, []));
    case 'EXECUTUON_OUTPUT':
      if (!state.output.has(action.id)) {
        return state;
      }
      return state.updateIn(['output', action.id], data => [...data, action.data]);
    case 'CLEAR_OUTPUT':
      return state.set('output', OrderedMap());
    case 'CONNECTED':
      return state.set('clientId', action.id);
    case 'CREATE':
      return state.merge({
        clientType: 'host',
        hostId: state.clientId,
        codeId: action.codeId,
        codeName: action.codeName,
        userName: action.userName,
      });
    case 'JOIN':
      return state.merge({
        clientType: 'guest',
        userName: action.userName,
      });
    case 'JOIN_ACCEPT':
      return state.merge({
        codeId: action.codeId,
      });
    case 'JOIN_REJECT':
      return state.merge({
        clientId: null,
      });
    default:
      return state;
  }
}

export default reducer;
