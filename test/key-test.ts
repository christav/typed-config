import { expect } from 'chai';

import { KeyInfo, OptionalInfo, OptionalInfos } from '../src/types';
import { KeyInfoSymbol, tryGetAtSymbol } from '../src/metadata';
import { key } from '../src/key';
import { asNumber } from '../src/transforms';

describe('key decorator', function () {
  describe('basic use', function () {
    const configKey = 'a.key.value';
    const propName = 'fieldName';
    let configProto: any;

    beforeEach(function () {
      configProto = {};
      const decorator = key(configKey);
      decorator(configProto, propName);
    });

    function getKeyInfo(): KeyInfo[] {
      return tryGetAtSymbol(configProto, KeyInfoSymbol);
    }

    it('should set keyInfo on prototype with one entry', function () {
      expect(getKeyInfo()).to.be.instanceof(Array).and.to.have.length(1);
    });

    it('should set configKey on loader', function () {
      expect(getKeyInfo()[0].loader).to.have.property('configKey', configKey);
    });

    it('should pass the property name to store\'s setKeyInfo method', function () {
      expect(getKeyInfo()[0]).to.have.property('propertyName', propName);
    });

    it('should not have any transforms', function () {
      expect(getKeyInfo()[0]).to.have.property('transformers')
        .to.be.instanceof(Array)
        .and.to.have.length(0);
    });
  });

  describe('with transforms', function () {
    const configKey = 'a.key.value';
    const propName = 'fieldName';
    const configProto = {};

    function xform2(proto: any, propName: string, value: any): any {
      return { value };
    }

    beforeEach(function () {
      const decorator = key(configKey, asNumber, xform2);
      decorator(configProto, propName);
    });

    it('should have stored transformers in order', function () {
      expect(tryGetAtSymbol<KeyInfo[]>(configProto, KeyInfoSymbol)[0])
        .to.have.property('transformers')
        .to.be.an.instanceof(Array)
        .and.eql([asNumber, xform2]);
    });
  });
});
