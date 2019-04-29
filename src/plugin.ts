import {WebpackPluginInstance} from 'webpack/declarations/WebpackOptions';
import {Compiler} from 'webpack';
import {AngularCompilerPlugin} from '@ngtools/webpack';
import {createTransformer} from './create-transformer';
import {AngularSvgIconsLoaderOptions} from './loader';

const pluginName = 'AngularSvgIconsPlugin';

export class AngularSvgIconsPlugin implements WebpackPluginInstance {
  constructor(
    private opts: AngularSvgIconsLoaderOptions
  ) {}

  apply(compiler: Compiler) {
    compiler.hooks.environment.tap(pluginName,
      () => {
        const angularCompilerPlugin = (compiler.options.plugins || [])
          .find(plugin =>
            plugin.constructor.name === 'AngularCompilerPlugin'
          ) as AngularCompilerPlugin;

        if (!angularCompilerPlugin) {
          // TODO: support JIT compilation
          return;
        }

        angularCompilerPlugin._transformers.unshift(
          createTransformer(this.opts)
        );
      }
    )
  }
}
