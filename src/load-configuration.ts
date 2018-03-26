//
// The actual configuration loader. This function will read the configuration source
// and fill in the values of the target object as indicated by the various decorators.
//

import { KeyInfo, OptionalInfo, ValueTransform, ConfigProvider } from './types';
import { getKeyInfo, getOptionalInfo } from './metadata';

export interface KeyInfoProvider {
  (obj: any): KeyInfo[];
}

// Dummy optionalInfo used for non-optional fields
const notOptional: OptionalInfo = {
  propertyName: 'n/a',
  predicate: () => true
};

export async function loadConfiguration(obj: any, configProvider: ConfigProvider): Promise<void> {
  const keyInfos = getKeyInfos(obj);
  const optionals = getOptionalInfo(obj);

  for (const info of keyInfos) {
    let value: any;

    const optionalInfo = optionals[info.propertyName] || notOptional;
    const shouldLoad = optionalInfo.predicate(obj, configProvider, info.propertyName, info.loader.configKey || '');

    if (!shouldLoad && optionalInfo.defaultValue !== undefined) {
      value = optionalInfo.defaultValue;
    } else if (shouldLoad) {
      value = await loadConfigValue(obj, configProvider, info);
    }

    if (value !== undefined) {
      obj[info.propertyName] = value;
    }
  }
}

function getKeyInfos(obj: any): KeyInfo[] {
  try {
    return getKeyInfo(obj);
  } catch (err) {
    throw new Error(`Cannot load configuration, the supplied object is not decorated for configuration loading`);
  }
}

async function loadConfigValue(obj: any, configProvider: ConfigProvider, info: KeyInfo): Promise<void> {
  let value = await info.loader(configProvider);
  for (const transform of info.transformers) {
    value = await transform(obj, info.propertyName, value);
  }
  obj[info.propertyName] = value;
}
