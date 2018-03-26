//
// Test for various transformation functions in isolation
//

import { expect } from 'chai';
import { ValueTransform } from '../src/types';
import { asNumber, asBoolean, split, map, trim } from '../src/transforms';

describe('transforms', function () {
  describe('asNumber', function () {
    it('should convert string to number', function () {
      const value: any = asNumber('12');
      expect(typeof value).to.equal('number');
      expect(value).to.equal(12);
    });
  });

  describe('asBoolean', function () {
    it('should convert true string to true', function () {
      expect(asBoolean('true')).to.be.true;
    });

    it('should be case insensitive for true values', function () {
      expect(asBoolean('TrUe')).to.be.true;
    });

    it('should convert everything else as false', function () {
      expect(asBoolean('false')).to.be.false;
      expect(asBoolean('no')).to.be.false;
      expect(asBoolean('yes')).to.be.false;
      expect(asBoolean('')).to.be.false;
    });
  });

  describe('split', function () {
    it('should split on given character into array', function () {
      const result: string[] = split(',')('a,b,cd,ef');
      expect(result).to.eql(['a', 'b', 'cd', 'ef']);
    });

    it('should result in one arg array if no separators in source', function () {
      const result: string = split(',')('no commas here');
      expect(result).to.eql(['no commas here']);
    });
  });

  describe('map', function () {
    it('should run transform over array', async function () {
      const result: any[] = await map(asNumber)(['1', '34', '42']);
      expect(result).to.eql([1, 34, 42]);
    });

    it('should pass target and propname through to transform', async function () {
      const mapper: ValueTransform = map((value: any, target: any, propName: string): any => ({ value, target, propName }));
      const target = { targetValue: 17 };
      const result: any[] = await mapper(['a', 'b'], target, 'aprop');
      expect(result).to.eql([
        {
          value: 'a',
          target: target,
          propName: 'aprop'
        },
        {
          value: 'b',
          target: target,
          propName: 'aprop'
        }
      ]);
    });
  });

  describe('trim', function () {
    it('should remove leading and trailing whitespace', function () {
      expect(trim('  this is extra stuff  \n   ')).to.equal('this is extra stuff');
      expect(trim('this just has trailing whitespace  \t  ')).to.equal('this just has trailing whitespace');
      expect(trim('    leading whitespace')).to.equal('leading whitespace');
      expect(trim('trailing newlines must go\n')).to.equal('trailing newlines must go');
    });

    it('should not affect strings without leading or trailing whitespace', function () {
      expect(trim('no trim needed here')).to.equal('no trim needed here');
    });
  });
});
