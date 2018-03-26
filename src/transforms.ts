//
// Various transform functions useful in loading configuration.
//

import { ValueTransform } from './types';

//
// Type converters
//

export function asNumber(value: any): number {
  return +value;
}

export function asBoolean(value: any): boolean {
  return (value as string).toLowerCase() === 'true';
}

//
// Split into an array of strings
//
export function split(splitChar: string): ValueTransform {
  return function split(value: any): string[] {
    return (value as string).split(splitChar);
  };
}

//
// Map a single transformation function over an array of values
//
export function map(transform: ValueTransform): ValueTransform {
  return function mapTransform(value: any, target?: any, propName?: string): Promise<any> {
    let result = Promise.resolve([]);
    (value as any[]).forEach((value: any) => {
      result = result.then((results) =>
        Promise.resolve(transform(value, target, propName))
        .then((result) => results.concat(result)));
    });
    return result;
  };
}

//
// Trim leading and trailing whitespace from a string value
//
export function trim(value: any): string {
  const stringValue: string = value.toString();
  return stringValue.match(/^\s*(.*?)\s*$/m)[1];
}
