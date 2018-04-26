//
// Decorators and handlers for optional settings.
// An optional setting will check a predicate first
// By default, the check is if the key is present
// in the config source.
//

import { OptionalInfoSymbol, setOptionalInfo } from './metadata';
import { OptionalInfo, OptionalInfos, OptionalPredicate, PropertyDecorator, ConfigProvider } from './types';

// Implementations of the various overloads
function plainOptional(): PropertyDecorator {
  return function optionalDecorator(proto: any, propertyName: string) {
    setOptionalInfo(proto, { propertyName, predicate: checkConfigPredicate });
  };
}

function optionalWithDefault(defaultValue: any): PropertyDecorator {
  return function optionalDecoratorWithDefault(proto: any, propertyName: string) {
    setOptionalInfo(proto, { propertyName, predicate: checkConfigPredicate, defaultValue });
  };
}

function optionalWithPredicate(predicate: OptionalPredicate): PropertyDecorator {
  return function optionalDecoratorWithPredicate(proto: any, propertyName: string) {
    setOptionalInfo(proto, { propertyName, predicate });
  };
}

function optionalWithPredicateAndDefault(predicate: OptionalPredicate, defaultValue: any): PropertyDecorator {
  return function optionalDecoratorWithPredicateAndDefault(proto: any, propertyName: string) {
    setOptionalInfo(proto, { propertyName, predicate, defaultValue });
  };
}

export function optional(predicate: OptionalPredicate, defaultValue: any): PropertyDecorator;
export function optional(predicate: OptionalPredicate): PropertyDecorator;
export function optional(defaultValue: any): PropertyDecorator;
export function optional(): PropertyDecorator;
export function optional(...args: any[]): PropertyDecorator {
  if (args.length === 0) {
    return plainOptional();
  } else if (args.length === 1 && typeof args[0] === 'function') {
    return optionalWithPredicate(args[0] as OptionalPredicate);
  } else if (args.length === 1) {
    return optionalWithDefault(args[0]);
  } else {
    return optionalWithPredicateAndDefault(args[0] as OptionalPredicate, args[1]);
  }
}

function checkConfigPredicate(target: any, propertyName: string, keyName: string, config: ConfigProvider): boolean {
  return config.has(keyName);
}
