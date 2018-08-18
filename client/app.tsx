import * as React from 'react';
import { hot } from 'react-hot-loader';
import { createStore, applyMiddleware, compose, Action } from 'redux';
import { connect } from 'react-redux';
import { createEpicMiddleware } from 'redux-observable';
import thunk from 'redux-thunk';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Loader, Dimmer } from 'semantic-ui-react';

import { model } from 'services/code';
import Editor from 'components/editor';
import Header from 'components/header';
import Output from 'components/output';
import { CodeDatabase } from 'services/storage';
import { epic, Dependencies, EpicType } from 'epics';
import reducer, { State } from 'reducer';
import { Connection } from 'services/connection';

import './style.scss';

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const epicMiddleware = createEpicMiddleware<Action<any>, Action<any>, State, Dependencies>({
  dependencies: {
    textModel: model,
    db: new CodeDatabase(),
    connection: new Connection(),
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

const App = ({ clientId }: { clientId: string }) => (
  <>
    {clientId || (
      <Dimmer active>
        <Loader size="massive">Loading</Loader>
      </Dimmer>
    )}
    <Header />
    <Editor model={model} />
    <Output />
  </>
);

export default hot(module)(
  connect((state: State) => ({
    clientId: state.clientId,
  }))(App),
);
