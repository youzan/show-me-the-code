import { combineEpics, Epic, ofType } from 'redux-observable';
import { from, Observable, merge } from 'rxjs';
import { tap, ignoreElements, withLatestFrom, switchMap, mapTo, map } from 'rxjs/operators';
import * as monaco from 'monaco-editor';

import {
  ChangeLanguageAction,
  LanguageDidChangeAction,
  SaveAxtion,
  ExecutionAction,
  ExecutionOutputAction,
  ConnectedAction,
  StopExecutionAction,
} from 'actions';
import { State } from 'reducer';
import { CodeDatabase } from 'services/storage';
import { Dispatch } from 'redux';
import { Connection } from 'services/connection';
import { ExecutionService } from 'services/execution';

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
  | ExecutionAction;

export type OutputAction = InputAction | LanguageDidChangeAction;

export type EpicType = Epic<InputAction, any, State, Dependencies>;

const changeLanguageEpic: EpicType = (action$, state$, { textModel }) =>
  action$.pipe(
    ofType('LANGUAGE_CHANGE'),
    tap(({ language }: ChangeLanguageAction) => monaco.editor.setModelLanguage(textModel, language)),
    ignoreElements(),
  );

const languageDidChangeEpic: EpicType = (action$, state$, { textModel }) => {
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
    switchMap(([_, state]) =>
      from(
        db.code.add({
          id: state.codeId,
          content: textModel.getValue(),
          language: state.language,
        }),
      ),
    ),
    mapTo({
      type: 'SAVE_SUCCESS',
    }),
  );

const connectionEpic: EpicType = (action$, state$, { connection }) =>
  connection.connection$.pipe(
    map(id => ({
      type: 'CONNECTED',
      id,
    })),
  );

const stopExecutionEpic: EpicType = (action$, state$, { executionService }) =>
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

const outputEpic: EpicType = (action$, state$, { executionService }) =>
  merge(executionService.stdout$, executionService.stderr$).pipe(
    map(({ id, data }) => ({
      type: 'EXECUTUON_OUTPUT',
      id,
      data,
    })),
  );

export const epic = combineEpics<any, any, State, Dependencies>(
  changeLanguageEpic,
  languageDidChangeEpic,
  saveEpic,
  connectionEpic,
  stopExecutionEpic,
  outputEpic,
  executionEpic,
);
