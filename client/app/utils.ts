import { BehaviorSubject } from 'rxjs';
import EventEmitter from 'eventemitter3';
import { Channel } from 'phoenix';

export function update<T>(updater: (value: T) => T, value$: BehaviorSubject<T>) {
  value$.next(updater(value$.getValue()));
}

export function linkEvents(events: string[], channel: Channel, target: EventEmitter<string>) {
  const links: Record<string, number> = {};
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    links[event]  = channel.on(event, msg => target.emit(event, msg));
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

function blob2base64(blob: Blob): Promise<string> {
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
}

const PREFIX = 'data:application/octet-stream;base64,';

/**
 * encode array buffer to base64
 */
export async function encodeArrayBuffer(buffer: Uint8Array) {
  const blob = new Blob([buffer]);
  const base64 = await blob2base64(blob);
  return base64.substring(PREFIX.length);
}

declare global {
  interface Blob {
    arrayBuffer(): Promise<ArrayBuffer>;
  }
}

/**
 * decode base64 to array buffer
 */
export async function decodeArrayBuffer(base64: string) {
  const dataUrl = PREFIX + base64;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
