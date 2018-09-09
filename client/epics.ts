import { combineEpics, Epic, ofType } from 'redux-observable';
import { from, Observable, merge, never, of } from 'rxjs';
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
  SaveAxtion,
  ExecutionAction,
  ConnectedAction,
  StopExecutionAction,
  CreateAction,
  JoinAction,
  JoinAcceptedAction,
  JoinRejectAction,
} from 'actions';
import { State } from 'reducer';
import { CodeDatabase } from 'services/storage';
import { Connection, Response, JoinResponse, JoinCall } from 'services/connection';
import { ExecutionService } from 'services/execution';
import { confirmJoin } from 'notify';

export type Dependencies = {
  textModel: monaco.editor.ITextModel;
  db: CodeDatabase;
  connection: Connection;
  executionService: ExecutionService;
};

export type InputAction =
  | ChangeLanguageAction
  | SaveAxtion
  | ExecutionAction
  | ConnectedAction
  | StopExecutionAction
  | ExecutionAction
  | CreateAction
  | JoinAction;

export type OutputAction = InputAction | LanguageDidChangeAction;

export type EpicType = Epic<InputAction, any, State, Dependencies>;

const changeLanguageEpic: EpicType = (action$, _state$, { textModel }) =>
  action$.pipe(
    ofType('LANGUAGE_CHANGE'),
    tap(({ language }: ChangeLanguageAction) => monaco.editor.setModelLanguage(textModel, language)),
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
    ofType('JOIN'),
    switchMap(({ hostId, userName }: JoinAction) =>
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
    catchError<void, JoinRejectAction>(() =>
      of({
        type: 'JOIN_REJECT',
      }),
    ),
  );

const joinHandleEpic: EpicType = (_action$, state$, { connection, textModel }) =>
  connection.message$.pipe(
    filter(msg => msg.type === 'join'),
    withLatestFrom(state$),
    mergeMap(([msg, state]: [JoinCall, State]) => {
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
            }),
        ),
        switchMap(() =>
          connection.message$.pipe(
            filter((res: Response) => res.type === 'joinAck' && res.requestId === msg.requestId),
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
