import type * as webpack from 'webpack';
import type {AngularCompilerPlugin, ivy} from '@ngtools/webpack';

export function findAngularCompilerPlugin(plugins: webpack.Plugin[] | undefined): AngularCompilerPlugin | undefined {
  return findWebpackPluginByName(plugins, 'AngularCompilerPlugin');
}

export function findAngularWebpackPlugin(plugins: webpack.Plugin[] | undefined): ivy.AngularWebpackPlugin | undefined {
  return findWebpackPluginByName(plugins, 'AngularWebpackPlugin');
}

function findWebpackPluginByName<TPlugin extends webpack.Plugin>(
  plugins: webpack.Plugin[] | undefined,
  name: string
): TPlugin | undefined {
  return (plugins || []).find(
    (plugin: webpack.Plugin): plugin is TPlugin => plugin.constructor.name === name
  );
}
