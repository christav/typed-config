//
// Implementation of the @key decorator.
//
// This is the workhorse of this package, and lets you specify what key
// in the config to read a property from, and a set of transforms to the
// value of that key after being loaded.
//

import { KeyInfoSymbol, setKeyInfo } from './metadata';
import { ConfigProvider, ValueTransform, KeyInfo, KeyLoader, PropertyDecorator } from './types';

export function scalarLoader(configKey: string): KeyLoader {
  const loader: any = function loader(config: ConfigProvider): Promise<any> {
    return Promise.resolve(config.get(configKey));
  };
  loader.configKey = configKey;
  return loader;
}

export function key(keyName: string, ...transforms: ValueTransform[]): PropertyDecorator {
  return function keyDecorator(proto: any, propName: string) {
    setKeyInfo(proto, {
      propertyName: propName,
      loader: scalarLoader(keyName),
      transformers: transforms
    });
  };
}
