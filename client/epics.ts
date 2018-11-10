import { combineEpics, Epic, ofType } from 'redux-observable';
import { from, Observable, merge, never, of, Subject } from 'rxjs';
import {
  tap,
  ignoreElements,
  withLatestFrom,
  switchMap,
  mapTo,
  map,
  catchError,
  mergeMap,
  filter,
} from 'rxjs/operators';
import * as monaco from 'monaco-editor';

import {
  ChangeLanguageAction,
  LanguageDidChangeAction,
  SaveAction,
  ExecutionAction,
  ConnectedAction,
  StopExecutionAction,
  CreateAction,
  JoinStartAction,
  JoinAcceptedAction,
  JoinRejectAction,
  JoinAckAction,
} from 'actions';
import { State } from 'reducer';
import { CodeDatabase } from 'services/storage';
import { Connection, JoinResponse, MessageType } from 'services/connection';
import { ExecutionService } from 'services/execution';
import { confirmJoin } from 'notify';

export type Dependencies = {
  textModel: monaco.editor.ITextModel;
  db: CodeDatabase;
  connection: Connection;
  executionService: ExecutionService;
  undo$: Subject<string>;
};

export type InputAction =
  | ChangeLanguageAction
  | SaveAction
  | ExecutionAction
  | ConnectedAction
  | StopExecutionAction
  | ExecutionAction
  | CreateAction
  | JoinStartAction;

export type OutputAction = InputAction | LanguageDidChangeAction;

export type EpicType = Epic<any, any, State, Dependencies>;

const changeLanguageEpic: EpicType = (action$, _state$, { textModel }) =>
  action$.pipe(
    ofType('LANGUAGE_CHANGE'),
    tap<ChangeLanguageAction>(({ language }) => monaco.editor.setModelLanguage(textModel, language)),
    ignoreElements(),
  );

const languageDidChangeEpic: EpicType = (_action$, _state$, { textModel }) => {
  return new Observable<LanguageDidChangeAction>(observer => {
    const disposer = textModel.onDidChangeLanguage(e => {
      observer.next({
        type: 'LANGUAGE_DID_CHANGE',
        language: e.newLanguage,
      });
    });
    return disposer.dispose.bind(disposer);
  });
};

const saveEpic: EpicType = (action$, state$, { db, textModel }) =>
  action$.pipe(
    ofType('SAVE'),
    withLatestFrom(state$),
    switchMap(
      ([_, state]) =>
        state.codeId && state.codeName
          ? from(
              db.code.add({
                id: state.codeId,
                name: state.codeName,
                content: textModel.getValue(),
                language: state.language,
              }),
            )
          : never(),
    ),
    mapTo({
      type: 'SAVE_SUCCESS',
    }),
  );

const connectionEpic: EpicType = (_action$, _state$, { connection }) =>
  connection.connection$.pipe(
    map(id => ({
      type: 'CONNECTED',
      id,
    })),
  );

const stopExecutionEpic: EpicType = (action$, _state$, { executionService }) =>
  action$.pipe(
    ofType('STOP_EXECUTION'),
    tap(executionService.killAll.bind(executionService)),
    ignoreElements(),
  );

const executionEpic: EpicType = (action$, state$, { executionService, textModel }) =>
  action$.pipe(
    ofType('EXECUTION'),
    withLatestFrom(state$),
    tap(([{ id }, state]: [ExecutionAction, State]) => {
      executionService.execute(id, state.language, textModel.getValue());
    }),
    ignoreElements(),
  );

const outputEpic: EpicType = (_action$, _state$, { executionService }) =>
  merge(executionService.stdout$, executionService.stderr$).pipe(
    map(({ id, data }) => ({
      type: 'EXECUTUON_OUTPUT',
      id,
      data,
    })),
  );

const createEpic: EpicType = (action$, _state$, { textModel }) =>
  action$.pipe(
    ofType('CREATE'),
    tap(({ content }: CreateAction) => textModel.setValue(content)),
    ignoreElements(),
  );

const joinRequestEpic: EpicType = (action$, _state$, { connection }) =>
  action$.pipe(
    ofType('JOIN_START'),
    switchMap(({ hostId, userName }: JoinStartAction) =>
      from(
        connection.call<JoinResponse>({
          type: 'join',
          to: hostId,
          name: userName,
        }),
      ),
    ),
    tap(res =>
      connection.send({
        type: 'joinAck',
        to: res.from as string,
        requestId: res.requestId,
        ok: true,
      }),
    ),
    map<JoinResponse, JoinAcceptedAction>(res => ({
      type: 'JOIN_ACCEPT',
      codeId: res.codeId,
      codeContent: res.codeContent,
      codeName: res.codeName,
      language: res.language,
    })),
    catchError<any, JoinRejectAction>(() =>
      of({
        type: 'JOIN_REJECT',
      }) as any,
    ),
  );

const joinHandleEpic: EpicType = (_action$, state$, { connection, textModel }) =>
  connection.message$.pipe(
    filter(msg => msg.type === MessageType.JoinReq),
    withLatestFrom(state$),
    mergeMap<any, any>(([msg, state]) => {
      if (!msg.from) {
        return never();
      }
      return from(confirmJoin(msg.name)).pipe(
        mapTo(true),
        catchError(() => of(false)),
        tap(
          ok =>
            msg.from &&
            msg.requestId &&
            connection.send({
              type: 'joinResponse',
              to: msg.from,
              requestId: msg.requestId,
              ok,
              codeId: state.codeId,
              codeName: state.codeName,
              codeContent: textModel.getValue(),
              language: state.language,
            } as any),
        ),
        switchMap(() =>
          connection.message$.pipe(
            filter((res: any) => res.type === 'joinAck' && res.requestId === msg.requestId),
            mapTo<any, JoinAckAction>({
              type: 'JOIN_ACK',
              id: msg.from as string,
              name: msg.name,
            }),
          ),
        ),
      );
    }),
  );

export const epic = combineEpics<any, any, State, Dependencies>(
  changeLanguageEpic,
  languageDidChangeEpic,
  saveEpic,
  connectionEpic,
  stopExecutionEpic,
  outputEpic,
  executionEpic,
  createEpic,
  joinRequestEpic,
  joinHandleEpic,
);
