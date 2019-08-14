import { Injectable } from '@angular/core';
import { observable } from 'mobx';
import { MessageService } from 'primeng/components/common/messageservice';
import { EditorService } from './editor.service';

type IStdout =
  | {
      type: 'error';
      message: string;
    }
  | {
      type: 'symbol';
      text: string;
    }
  | {
      type: 'json';
      value: string;
    }
  | {
      type: 'text';
      value: string;
    }
  | {
      type: 'function';
      value: string;
    }
  | {
      type: 'raw';
      value: undefined | null | string | number | boolean;
    };

function deserialize(it: IStdout) {
  switch (it.type) {
    case 'error':
      return new Error(it.message);
    case 'symbol':
      return it.text;
    case 'json':
      return JSON.parse(it.value);
    case 'function':
    case 'raw':
    case 'text':
      return it.value;
  }
}

@Injectable()
export class ExecutionService {
  private worker: Worker | null = null;

  @observable
  output: unknown[][] = [];

  constructor(private readonly messageService: MessageService, private readonly editorService: EditorService) {}

  private workerEventListener = ({ data }: MessageEvent) => {
    switch (data.type) {
      case 'stdout':
        this.output.push(data.data.map(deserialize));
        break;
      case 'stderr':
        this.output.push(data.data.map((it: string) => new Error(it)));
        break;
      default:
        break;
    }
  }

  async exec(lang: string, code: string) {
    switch (lang) {
      case 'javascript':
        this.terminate();
        this.worker = new Worker('../executors/javascript', { type: 'module' });
        this.worker.addEventListener('message', this.workerEventListener);
        this.worker.postMessage({
          type: 'exec',
          code,
        });
        break;
      default:
        this.messageService.add({
          severity: 'error',
          summary: 'Not supported',
          detail: `Execution of ${lang} is not supported yet.`,
        });
        break;
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
