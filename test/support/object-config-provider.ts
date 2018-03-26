//
// A simple configuration provider that wraps an object.
//

import { ConfigProvider } from '../../src/types';

export class ObjectProvider implements ConfigProvider {
  public constructor(private sourceObj: any) { }

  public get(key: string) {
    if (!this.has(key)) {
      throw new Error(`Config provider does not have key ${key}`);
    }
    return this.sourceObj[key];
  }
  public has(key: string) { return this.sourceObj.hasOwnProperty(key); }
}
