import * as React from 'react';
import { createPortal } from 'react-dom';
import { hot } from 'react-hot-loader';
import { createStore, applyMiddleware, compose, Action } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import thunk from 'redux-thunk';
import { BehaviorSubject, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToastContainer } from 'react-toastify';

import { model } from 'services/code';
import Editor from 'components/editor';
import Header from 'components/header';
import Output from 'components/output';
import IndexModal from 'components/index-modal';
import Loading from 'components/loading';
import UserStatus from 'components/user-status';
import { CodeDatabase } from 'services/storage';
import { epic, Dependencies, EpicType } from 'epics';
import reducer, { State } from 'reducer';
import { Connection } from 'services/connection';
import { ExecutionService } from 'services/execution';

import './style.scss';

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const db = new CodeDatabase();
export const connection = new Connection();
export const executionService = new ExecutionService();
const undo$ = new Subject<string>();

const epicMiddleware = createEpicMiddleware<Action<any>, Action<any>, State, Dependencies>({
  dependencies: {
    textModel: model,
    db,
    connection,
    executionService,
    undo$,
  },
});

export const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk, epicMiddleware)));

if ((module as any).hot) {
  const epic$ = new BehaviorSubject(epic);
  const hotReloadingEpic: EpicType = (...args: any[]) => epic$.pipe(switchMap((epic: any) => epic(...args)));
  epicMiddleware.run(hotReloadingEpic);
  (module as any).hot.accept('epics', () => {
    const nextRootEpic = require('epics').epic;
    epic$.next(nextRootEpic);
  });
} else {
  epicMiddleware.run(epic);
}

if ((module as any).hot) {
  (module as any).hot.accept('reducer', () => {
    const nextReducer = require('reducer').default;

    store.replaceReducer(nextReducer);
  });
}

const toastContainer = document.createElement('div');
document.body.appendChild(toastContainer);

const App = () => (
  <>
    <Loading />
    <Header />
    <Editor model={model} undo$={undo$} />
    <Output />
    <IndexModal db={db} />
    <UserStatus />
    {createPortal(
      <ToastContainer
        position={'top-right' as any}
        autoClose={5000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />,
      toastContainer,
    )}
  </>
);

export default hot(module)(App);
