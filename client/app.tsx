import * as React from 'react';
import { createPortal } from 'react-dom';
import { hot } from 'react-hot-loader';
import { ToastContainer } from 'react-toastify';

import { CodeService } from './services/code';
import Editor from './components/editor';
import Header from './components/header';
import Output from './components/output';
import IndexModal from './components/index-modal';
import Loading from './components/loading';
import UserStatus from './components/user-status';
import { CodeDatabase } from './services/storage';

import { Connection } from './services/connection';
import { Execution } from './services/execution';

import './style.scss';
import { ViewModel } from './view-model';
import { Context } from './context';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { noop } from './utils';

const db = new CodeDatabase();
export const connection = new Connection();
const executionService = new Execution();
const codeService = new CodeService(db, connection);
const viewModel = new ViewModel(db, connection, executionService, codeService);

const toastContainer = document.createElement('div');
document.body.appendChild(toastContainer);

const {
  userName$,
  language$,
  fontSize$,
  loading$,
  hostId$,
  onLanguageChange,
  onFontSizeChange,
  hostName$,
  codeId$,
  clientType$,
  clients,
  output,
} = viewModel;

const modalOpen$ = codeId$.pipe(map(id => !id));

const modalLoading$ = combineLatest(clientType$, codeId$).pipe(
  map(([clientType, codeId]) => clientType === 'guest' && !codeId),
);

const App = () => (
  <Context.Provider
    value={{
      language$,
      fontSize$,
      loading$,
      hostId$,
      editorModel: codeService.model,
      onLanguageChange,
      onFontSizeChange,
      undo$: codeService.undo$,
      clients,
      output,
    }}
  >
    <Loading />
    <Header />
    <Editor />
    <Output data={output.blocks} />
    <IndexModal userName$={userName$} open$={modalOpen$} loading$={modalLoading$} onCreate={noop} onJoin={noop} />
    <UserStatus hostName$={hostName$} />
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
  </Context.Provider>
);

export default hot(module)(App);
