import * as React from 'react';
import { Component, createContext, createRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { connect } from 'react-redux';

import { State } from '../reducer';

import * as monaco from 'monaco-editor';

export type Props = {
  model: monaco.editor.ITextModel;
  fontSize: number;
};

class Editor extends Component<Props> {
  containerRef = createRef<HTMLDivElement>();
  editor: monaco.editor.IStandaloneCodeEditor | null = null;
  resizeObserver = new ResizeObserver(() => {
    this.editor && this.editor.layout();
  });

  componentDidMount() {
    if (!this.containerRef.current) {
      throw new Error('Fetal');
    }
    this.editor = monaco.editor.create(this.containerRef.current, {
      model: this.props.model,
      theme: 'vs-dark',
      fontSize: 12,
    });
    this.resizeObserver.observe(this.containerRef.current);
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.editor) {
      throw new Error('Fetal');
    }
    if (this.props.model !== prevProps.model) {
      this.editor.setModel(this.props.model);
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this.editor.updateOptions({
        fontSize: this.props.fontSize,
      });
    }
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
    if (!this.editor) {
      throw new Error('Fetal');
    }
    this.editor.dispose();
  }

  render() {
    return <div ref={this.containerRef} className="editor" />;
  }
}

export default connect((state: State) => ({
  fontSize: state.fontSize,
}))(Editor);
