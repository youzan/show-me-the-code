import * as React from 'react';
import { Component, createRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import * as monaco from 'monaco-editor';
import { Subscription, Observable } from 'rxjs';

export type Props = {
  model: monaco.editor.ITextModel;
  fontSize: number;
  undo$: Observable<never>;
  className?: string;
};

export default class MonacoEditor extends Component<Props> {
  containerRef = createRef<HTMLDivElement>();
  editor: monaco.editor.IStandaloneCodeEditor | null = null;
  resizeObserver = new ResizeObserver(() => {
    this.editor && this.editor.layout();
  });
  undoSubscription: Subscription | null = null;

  initUndo() {
    this.undoSubscription = this.props.undo$.subscribe(source => {
      (this.editor as monaco.editor.IStandaloneCodeEditor).trigger(source, 'undo', '');
    });
  }

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
    this.initUndo();
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
    if (this.props.undo$ !== prevProps.undo$) {
      this.undoSubscription && this.undoSubscription.unsubscribe();
      this.initUndo();
    }
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
    if (!this.editor) {
      throw new Error('Fetal');
    }
    this.undoSubscription && this.undoSubscription.unsubscribe();
    this.editor.dispose();
  }

  render() {
    const { className } = this.props;
    return <div ref={this.containerRef} className={className} />;
  }
}
