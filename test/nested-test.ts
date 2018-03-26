import { expect } from 'chai';

import { KeyInfo, ValueTransform, PropertyDecorator } from '../src/types';
import { key } from '../src/key';
import { nested } from '../src/nested';
import { loadConfiguration } from '../src/load-configuration';

function asNumber(target: any, propName: string, value: any): number {
  return +value;
}

class SubConfig {
  @key('sub.one')
  public one: string;

  @key('sub.two', asNumber)
  public two: number;
}

class Config {
  @key('first')
  public first: string;

  @nested(SubConfig)
  public nested: SubConfig;
}

describe('Nested decorator', function () {
  const configData: any = {
    first: 'Value for first key',
    'sub.one': 'Value for nested one',
    'sub.two': '37'
  };

  const configProvider = {
    get(key: string) { return configData[key]; },
    has(key: string) { return configData.hasOwnProperty(key); }
  };

  const loadedConfig = new Config();

  before(function () {
    return loadConfiguration(loadedConfig, configProvider);
  });

  it('should load top level property', function () {
    expect(loadedConfig.first).to.equal(configData.first);
  });

  it('should initialize nested property', function () {
    expect(loadedConfig.nested).to.be.instanceof(SubConfig);
  });

  it('should load subconfiguration properties', function () {
    expect(loadedConfig.nested.one).to.equal(configData['sub.one']);
    expect(typeof loadedConfig.nested.two).to.equal('number');
    expect(loadedConfig.nested.two).to.equal(+configData['sub.two']);
  });
});
