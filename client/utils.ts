import * as uuid from 'uuid/v1';
import { race, throwError, Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { useState, useEffect, SyntheticEvent, useCallback } from 'react';

export function noop() {}

export const uid = uuid;

export function timeoutWith<T>(time: number, r: Observable<T>) {
  return race(throwError('timeout').pipe(timeout(time * 1000)), r);
}

export function useSubscription<T>(value$: Observable<T>, defaultValue: T) {
  const [value, setValue] = useState(defaultValue);
  useEffect(
    () => {
      const subscription = value$.subscribe(value => {
        setValue(value);
      });
      return () => subscription.unsubscribe();
    },
    [value$, setValue],
  );
  return value;
}

export function useSubscriptionEffect<T>(event$: Observable<T>, callback: (value: T) => void) {
  useEffect(
    () => {
      const subscription = event$.subscribe(value => {
        callback(value);
      });
      return () => subscription.unsubscribe();
    },
    [event$, callback],
  );
}

export const useValueCallback = <T, C extends { value: T }>(callback: (value: T) => void) =>
  useCallback(
    (_e: SyntheticEvent<HTMLElement>, { value }: C) => {
      callback(value);
    },
    [callback],
  );

export function useValue<T, C extends { value: T }>(
  defaultValue: T,
): [T, (_e: SyntheticEvent<HTMLElement>, { value }: C) => void] {
  const [value, setValue] = useState(defaultValue);
  const callback = useValueCallback(setValue);
  return [value, callback];
}
