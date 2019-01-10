import { createContext } from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface IAppContext {
  language$: Observable<string>;
  onLanguageChange(language: string): void;
  fontSize$: Observable<number>;
  onFontSizeChange(fontSize: number): void;
  undo$: Observable<never>;
  loading$: Observable<boolean>;
  hostId$: Observable<string | null>;
}

export const Context = createContext<IAppContext>({
  language$: new BehaviorSubject('javascript'),
  onLanguageChange() {},
  fontSize$: new BehaviorSubject(14),
  onFontSizeChange() {},
  undo$: new Subject<never>(),
  loading$: new BehaviorSubject(false),
  hostId$: new BehaviorSubject(null),
});
