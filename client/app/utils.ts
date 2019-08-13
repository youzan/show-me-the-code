import { BehaviorSubject } from 'rxjs';
import EventEmitter from 'eventemitter3';
import { Channel } from 'phoenix';

export function update<T>(updater: (value: T) => T, value$: BehaviorSubject<T>) {
  value$.next(updater(value$.getValue()));
}

export function linkEvents(events: string[], channel: Channel, target: EventEmitter) {
  const links: Record<string, number> = {};
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    const ref = channel.on(event, msg => target.emit(event, msg));
    links[event] = ref;
  }
  return links;
}

declare module 'phoenix' {
  interface Channel {
    off(event: string, ref: number): void;
  }
}

export function unlinkEvents(links: Record<string, number>, channel: Channel) {
  const events = Object.keys(links);
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    const ref = links[event];
    channel.off(event, ref);
  }
}
