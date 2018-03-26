import { KeyInfo, OptionalInfo, OptionalInfos } from './types';

//
// Symbols used to find metadata for the various properties
//

export const KeyInfoSymbol = Symbol('configkeyinfo');
export const OptionalInfoSymbol = Symbol('optionalkeyinfo');

//
// Helper function to get value at a symbol from an object,
// regardless of if the target is the prototype directly,
// a constructor function, or an instance.
//
export function tryGetAtSymbol<T>(target: any, key: symbol): T {
  if (target[key]) {
    return target[key] as T;
  }

  if (typeof target === 'function' && target.prototype && target.prototype[key]) {
    return target.prototype[key] as T;
  }

  if (Object.getPrototypeOf(target)[key]) {
    return Object.getPrototypeOf(target)[key] as T;
  }

  return undefined;
}

export function getAtSymbol<T>(target: any, key: symbol, errorMessage: string): T {
  const value = tryGetAtSymbol(target, key) as T;
  if (value === undefined) {
    throw new Error(errorMessage);
  }
  return value;
}

export function getKeyInfo(obj: any): KeyInfo[] {
  return getAtSymbol<KeyInfo[]>(obj, KeyInfoSymbol, 'Object provided has no config key information');
}

export function setKeyInfo(proto: any, info: KeyInfo): void {
  const infoList = proto[KeyInfoSymbol] as KeyInfo[] || [];
  if (infoList.length > 0 && infoList[infoList.length - 1].propertyName === info.propertyName) {
    throw new Error(`Configuration definition error: Multiple keys or nested specified for property ${info.propertyName}`);
  }

  infoList.push(info);
  proto[KeyInfoSymbol] = infoList;
}

export function getOptionalInfo(obj: any): OptionalInfos {
  const infos = tryGetAtSymbol<OptionalInfos>(obj, OptionalInfoSymbol) || {};
  return infos;
}

export function setOptionalInfo(proto: any, info: OptionalInfo): void {
  const infos = (proto[OptionalInfoSymbol] || {}) as OptionalInfos;
  infos[info.propertyName] = info;
  proto[OptionalInfoSymbol] = infos;
}
