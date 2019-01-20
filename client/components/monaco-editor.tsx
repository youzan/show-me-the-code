import * as React from 'react';
import { Component, createRef } from 'react';
import * as monaco from 'monaco-editor';
import ResizeObserver from 'resize-observer-polyfill';

export interface IMonacoEditorProps {
  className?: string;
  model: monaco.editor.ITextModel;
}

class MonacoEditor extends Component<IMonacoEditorProps> {
  private readonly containerRef = createRef<HTMLDivElement>();
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private resizeObserver = new ResizeObserver(() => {
    this.editor && this.editor.layout();
  });

  undo(source: string) {
    this.editor && this.editor.trigger(source, 'undo', '');
  }

  setFontSize(fontSize: number) {
    this.editor &&
      this.editor.updateOptions({
        fontSize,
      });
  }

  componentDidMount() {
    const el = this.containerRef.current;
    const { model } = this.props;
    if (el) {
      this.editor = monaco.editor.create(el, {
        model,
        theme: 'vs-dark',
        fontSize: 12,
      });
      this.resizeObserver.observe(el);
    }
  }

  componentDidUpdate(prevProps: IMonacoEditorProps) {
    if (this.props.model !== prevProps.model) {
      this.editor && this.editor.setModel(this.props.model);
    }
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
    this.editor && this.editor.dispose();
    this.editor = null;
  }

  render() {
    const { className } = this.props;
    return <div ref={this.containerRef} className={className} />;
  }
}

export default MonacoEditor;
