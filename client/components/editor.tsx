import * as React from 'react';
import { useContext } from 'react';

import { Context } from '../context';
import { useSubscription } from '../utils';
import MonacoEditor from './monaco-editor';

const Editor = () => {
  const { undo$, fontSize$, editorModel } = useContext(Context);
  const fontSize = useSubscription(fontSize$, 14);

  return <MonacoEditor fontSize={fontSize} undo$={undo$} model={editorModel} />
}

export default Editor;
