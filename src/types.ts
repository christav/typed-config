//
// Various type definitions uses throughout this module.
//

// Provider that will retrieve a string from a configuration source by name.
export interface ConfigProvider {
  get(key: string): string;
  has(key: string): boolean;
}

//
// Function used as a transformation on a key value as it gets loaded.
//
export interface ValueTransform {
  (value: any, target?: any, propName?: string): any;
}

//
// Function that will call the config provider to load a value.
//
export interface KeyLoader {
  (configProvider: ConfigProvider): Promise<any>;
  configKey: string;
}

//
// Information about a particular property and the configuration to
// load it.
//
export interface KeyInfo {
  propertyName: string;
  loader: KeyLoader;
  transformers: ValueTransform[];
}

//
// Type of a property decorator expression
//
export interface PropertyDecorator {
  (proto: any, prop: string): void;
}

//
// Type of optional predicate function.
//
export interface OptionalPredicate {
  (target: any, config?: ConfigProvider, propertyName?: string, keyName?: string): boolean;
}

//
// Information about an optional field
//
export interface OptionalInfo {
  propertyName: string;
  predicate: OptionalPredicate;
  defaultValue?: any;
}

export type OptionalInfos = { [key: string]: OptionalInfo };
