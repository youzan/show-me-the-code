import { BehaviorSubject } from 'rxjs';

export function update<T>(updater: (value: T) => T, value$: BehaviorSubject<T>,) {
  return value$.next(updater(value$.getValue()))
}