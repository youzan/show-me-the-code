import * as React from 'react';
import { useRef, useLayoutEffect, useEffect } from 'react';
import { connect } from 'react-redux';
import * as monaco from 'monaco-editor';
import { Subject } from 'rxjs';

import MonacoEditor from './monaco-editor';
import { State } from '../reducer';

export type IEditorProps = {
  model: monaco.editor.ITextModel;
  fontSize: number;
  undo$: Subject<string>;
};

const Editor: React.FunctionComponent<IEditorProps> = ({ model, fontSize, undo$ }) => {
  const editorRef = useRef<MonacoEditor | null>(null);

  useLayoutEffect(
    () => {
      const editor = editorRef.current;
      if (editor) {
        editor.setFontSize(fontSize);
      }
    },
    [fontSize],
  );

  useEffect(
    () => {
      const subscription = undo$.subscribe(source => {
        const editor = editorRef.current;
        if (editor) {
          editor.undo(source);
        }
      });
      return () => subscription.unsubscribe();
    },
    [undo$],
  );

  return <MonacoEditor ref={editorRef} className="editor" model={model} />;
};

export default connect((state: State) => ({
  fontSize: state.fontSize,
}))(Editor);
