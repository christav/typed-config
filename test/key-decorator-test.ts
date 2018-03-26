import { expect } from 'chai';
import { KeyInfo } from '../src/types';
import { key as rawkey } from '../src/key';
import { getKeyInfo } from '../src/metadata';

function key(configKey: string) {
  return rawkey(configKey);
}

class SampleConfig {
  @key('a.setting')
  public setting1: string;

  @key('another.setting')
  public setting2: string;

  @key('more.setting')
  public setting3: string;
}

describe('Decorated class', function () {
  it('should have key info', function () {
    const config = new SampleConfig();
    expect(getKeyInfo(config)).to.exist;
  });

  it('should have the correct number of key infos', function () {
    const config = new SampleConfig();
    expect(getKeyInfo(config)).to.have.length(3);
  });

  it('should have the right matching of names and keys', function () {
    const expected = [
      { key: 'a.setting', prop: 'setting1' },
      { key: 'another.setting', prop: 'setting2' },
      { key: 'more.setting', prop: 'setting3' }
    ];
    const infos = getKeyInfo(SampleConfig);
    expected.forEach((ex, i) => {
      expect(infos[i].loader.configKey).to.equal(ex.key);
      expect(infos[i].propertyName).to.equal(ex.prop);
    });
  });
});
