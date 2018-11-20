import * as uuid from 'uuid/v1';
import { race, throwError, Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export function noop() {}

export const uid = uuid;

export function timeoutWith<T>(time: number, r: Observable<T>) {
  return race(throwError('timeout').pipe(timeout(time * 1000)), r);
}
