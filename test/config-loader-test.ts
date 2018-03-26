import { expect } from 'chai';

import { KeyInfo, OptionalInfo, OptionalInfos, ValueTransform, ConfigProvider } from '../src/types';
import { loadConfiguration } from '../src/load-configuration';
import { scalarLoader } from '../src/key';
import { KeyInfoSymbol } from '../src/metadata';

describe('Config loader', function () {
  describe('basic settings', function () {
    const keyInfo: KeyInfo[] = [
      {
        propertyName: 'prop1',
        loader: scalarLoader('key1'),
        transformers: []
      },
      {
        propertyName: 'prop2',
        loader: scalarLoader('keythesecond'),
        transformers: []
      }
    ];

    const configSettings: any = {
      key1: 'value for key1',
      keythesecond: 'and a value for the second key'
    };

    const configProto: any = {};
    configProto[KeyInfoSymbol] = keyInfo;
    const loadedConfig: any = Object.create(configProto);

    const configProvider: ConfigProvider = {
      get(key: string) { return configSettings[key]; },
      has(key: string) { return configSettings.hasOwnProperty(key); }
    };

    before(function () {
      return loadConfiguration(loadedConfig, configProvider);
    });

    it('should set all values from configuration', function () {
      keyInfo.forEach((key) => {
        expect(loadedConfig[key.propertyName]).to.equal(configSettings[key.loader.configKey]);
      });
    });
  });

  describe('with transforms', function () {
    function toNumber(target: any, propName: string, value: any): number {
      return +value;
    }

    function split(splitChar: string): ValueTransform {
      return function (target: any, prop: string, value: any): string[] {
        return (value as string).split(splitChar);
      };
    }

    function titleCase(target: any, prop: string, value: any): string {
      const s: string = value.toString();
      return s.slice(0, 1).toUpperCase() + s.slice(1);
    }

    function reverse(target: any, prop: string, value: any): string {
      const s: string = value.toString();
      return s.split('').reverse().join('');
    }

    function asyncTransform(target: any, prop: string, value: any): Promise<string> {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(value), 10);
      });
    }

    const keyInfo: KeyInfo[] = [
      {
        propertyName: 'numericProperty',
        loader: scalarLoader('key1'),
        transformers: [toNumber]
      },
      {
        propertyName: 'arrayProperty',
        loader: scalarLoader('keythesecond'),
        transformers: [split(',')]
      },
      {
        propertyName: 'multiTransformProperty',
        loader: scalarLoader('key3'),
        transformers: [titleCase, reverse]
      },
      {
        propertyName: 'asyncProperty',
        loader: scalarLoader('key4'),
        transformers: [asyncTransform]
      }
    ];

    const configSettings: any = {
      key1: '42',
      keythesecond: 'value1,value2,value3',
      key3: 'this will be reversed',
      key4: 'an async value'
    };

    const loadedConfig: any = Object.create({ [KeyInfoSymbol]: keyInfo });

    const configProvider: ConfigProvider = {
      get(key: string) { return configSettings[key]; },
      has(key: string) { return configSettings.hasOwnProperty(key); }
    };

    before(function () {
      return loadConfiguration(loadedConfig, configProvider);
    });

    it('should run transform on numeric property as part of loading', function () {
      expect(typeof loadedConfig.numericProperty).to.equal('number');
      expect(loadedConfig.numericProperty).to.equal(+configSettings.key1);
    });

    it('should run transform for array property as part of loading', function () {
      expect(loadedConfig.arrayProperty).to.be.instanceof(Array);
      expect(loadedConfig.arrayProperty).to.have.length(3);
    });

    it('should run multiple transforms for property as part of loading', function () {
      expect(typeof loadedConfig.multiTransformProperty).to.equal('string');
      expect(loadedConfig.multiTransformProperty).to.equal('desrever eb lliw sihT');
    });

    it('should wait to resolve any async transforms', function () {
      expect(typeof loadedConfig.asyncProperty).to.equal('string');
      expect(loadedConfig.asyncProperty).to.equal(configSettings.key4);
    });
  });
});
