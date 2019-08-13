import { IUser } from '../models';

export interface IMap {
  __userMap: never;
}

export function make(): IMap;

export function fromArray(users: IUser[]): IMap;

export function add(user: IUser, map: IMap): IMap;

export function addMany(users: IUser[], map: IMap): IMap;

export function remove(userId: string, map: IMap): IMap;

export function first(map: IMap): IUser | undefined;

export function size(map: IMap): number;

export function valuesArray(map: IMap): IUser[];

export function toArray(map: IMap): Array<[string, IUser]>;
