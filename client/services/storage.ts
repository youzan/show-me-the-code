import Dexie from 'dexie';

import { NAME } from '../constants';

export type Code = {
  id: string;
  language: string;
  content: string;
}

export class CodeDatabase extends Dexie {
  code: Dexie.Table<Code, string>;

  constructor() {
    super(NAME);
    this.version(1).stores({
      code: "++id, name, language, content"
    });
    this.code = (this as any).code;
  }
}

export default CodeDatabase;
