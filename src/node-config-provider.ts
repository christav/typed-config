//
// Config provider that uses the node-config package to get values.
//

import { ConfigProvider } from './types';
import * as NodeConfig from 'config';

export const nodeConfigProvider: ConfigProvider = {
  get(keyName: string) { return NodeConfig.get(keyName); },
  has(keyName: string) { return NodeConfig.has(keyName); }
};
