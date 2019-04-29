import * as webpack from 'webpack';
import {AngularCompilerPlugin} from '@ngtools/webpack';

export function findAngularCompilerPlugin(plugins: webpack.Plugin[]): AngularCompilerPlugin | undefined {
  return plugins.find(
    plugin => plugin.constructor.name === 'AngularCompilerPlugin'
  ) as AngularCompilerPlugin;
}
