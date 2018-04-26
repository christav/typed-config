import { expect } from 'chai';

import { OptionalInfo, OptionalInfos, KeyInfo } from '../src/types';
import { OptionalInfoSymbol } from '../src/metadata';
import { optional } from '../src/optional';
import { ObjectProvider } from './support/object-config-provider';

describe('optional decorator', function () {
  describe('basic use', function () {
    const propName = 'optionalProperty';
    const keyName = 'optional-property-key';
    let configProto: any;

    describe('with no predicate or default value', function () {
      beforeEach(function () {
        configProto = {};
        const decorator = optional();
        decorator(configProto, propName);
      });

      it('should have OptionalInfos set on the prototype', function () {
        expect(configProto[OptionalInfoSymbol]).to.exist;
      });

      it('should set the optionalInfo property to the property name', function () {
        expect(configProto[OptionalInfoSymbol]).to.have.property(propName);
      });

      it('should have predicate that passes if key is in config store', function () {
        const config = new ObjectProvider({
          [keyName]: "here's a value"
        });

        const optInfo = configProto[OptionalInfoSymbol][propName] as OptionalInfo;
        expect(optInfo.predicate({}, propName, keyName, config)).to.be.true;
      });

      it('should have predicate that fails if key is not in config source', function () {
        const config = new ObjectProvider({
        });

        const optInfo = configProto[OptionalInfoSymbol][propName] as OptionalInfo;
        expect(optInfo.predicate({}, propName, keyName, config)).to.be.false;
      });
    });

    describe('with default value', function () {
      const defaultValue = 'not present';

      beforeEach(function () {
        configProto = {};
        const decorator = optional(defaultValue);
        decorator(configProto, propName);
      });

      it('should have OptionalInfos set on the prototype', function () {
        expect(configProto[OptionalInfoSymbol]).to.exist
          .and.to.have.property(propName);
      });

      it('should have specified default value', function () {
        const optInfo = configProto[OptionalInfoSymbol][propName] as OptionalInfo;
        expect(optInfo.defaultValue).to.equal(defaultValue);
      });
    });

    describe('with predicate', function () {
      function customPredicate(target: any): boolean {
        return true;
      }

      beforeEach(function () {
        configProto = {};
        const decorator = optional(customPredicate);
        decorator(configProto, propName);
      });

      it('should set optionalInfo on prototype', function () {
        expect(configProto[OptionalInfoSymbol]).to.exist
          .and.to.have.property(propName);
      });

      it('should set predicate', function () {
        const optInfo = configProto[OptionalInfoSymbol][propName] as OptionalInfo;
        expect(optInfo).to.have.property('predicate', customPredicate);
        expect(optInfo).to.not.have.property('defaultValue');
      });
    });

    describe('with predicate and default value', function () {
      const defaultValue = 'not present';

      function customPredicate(target: any): boolean {
        return true;
      }

      beforeEach(function () {
        configProto = {};
        const decorator = optional(customPredicate, defaultValue);
        decorator(configProto, propName);
      });

      it('should store the info on prototype', function () {
        const optInfos = configProto[OptionalInfoSymbol];
        expect(optInfos).to.exist;
        const optInfo = optInfos[propName] as OptionalInfo;
        expect(optInfo).to.include({
          propertyName: propName,
          predicate: customPredicate,
          defaultValue
        });
      });
    });
  });
});
