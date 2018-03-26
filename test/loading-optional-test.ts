// Tests for loading config that are marked optional in various combinations

import { expect } from 'chai';

import { KeyInfo, OptionalInfo, OptionalInfos } from '../src/types';
import { key } from '../src/key';
import { optional } from '../src/optional';
import { loadConfiguration } from '../src/load-configuration';

import { ObjectProvider } from './support/object-config-provider';

// Our sample config class
class ConfigWithOptionals {
  @key('required')
  public required: string;

  @key('optional.present')
  @optional()
  public optionalAndPresent: string;

  @key('optional.notpresent')
  @optional()
  public optionalNotPresent: string;

  @key('optional.defaultandpresent')
  @optional('default value')
  public optionalWithDefaultAndPresent: string;

  @key('optional.defaultandnotpresent')
  @optional('not present in config')
  public optionalWithDefaultAndNotPresent: string;

  @key('optional.passingpredicate')
  @optional((o) => true)
  public optionalWithPassingPredicate: string;

  @key('optional.failingpredicate')
  @optional((o) => false)
  public optionalWithFailingPredicate: string;

  @key('optional.passingpredicatewithdefault')
  @optional((o) => true, 'default value')
  public optionalWithPassingPredicateAndDefault: string;

  @key('optional.failingpredicatewithdefault')
  @optional((o) => false, 'default if predicate failed')
  public optionalWithFailingPredicateAndDefault: string;
}

describe('optional loading', function () {
  const loadedConfig = new ConfigWithOptionals();

  const configSource = new ObjectProvider({
    required: 'required value',
    'optional.present': 'optional was here',
    'optional.defaultandpresent': 'not the default value',
    'optional.passingpredicate': 'the predicate passed',
    'optional.passingpredicatewithdefault': 'this predicate passed too'
  });

  before(function () {
    return loadConfiguration(loadedConfig, configSource);
  });

  it('should load expected values', function () {
    expect(loadedConfig).to.include({
      required: 'required value',
      optionalAndPresent: 'optional was here',
      optionalWithDefaultAndPresent: 'not the default value',
      optionalWithPassingPredicate: 'the predicate passed',
      optionalWithPassingPredicateAndDefault: 'this predicate passed too',
      optionalWithFailingPredicateAndDefault: 'default if predicate failed'
    });
  });

  it('should not load failing optional properties', function () {
    expect(loadedConfig).to.not.have.any.keys(
      'optionalNotPresent',
      'optionalWithFailingPredicate',
    );
  });
});
