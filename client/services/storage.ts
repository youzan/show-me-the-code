import Dexie from 'dexie';
import { createContext } from 'react';

import { NAME } from '../constants';

export type Code = {
  id: string;
  name: string;
  language: string;
  content: string;
}

export class CodeDatabase extends Dexie {
  code!: Dexie.Table<Code, string>;

  constructor() {
    super(NAME);
    this.version(1).stores({
      code: "++id, name, language, content"
    });
  }

  getIndexList() {
    return this.code.toArray();
  }
}

export const StorageContext = createContext<CodeDatabase>(null as any);

export default CodeDatabase;
