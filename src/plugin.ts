import {Compiler} from 'webpack';
import {AngularCompilerPlugin} from '@ngtools/webpack';
import {createTransformer} from './create-transformer';
import {AngularSvgIconsOptions} from './types';

const pluginName = 'AngularSvgIconsPlugin';

export class AngularSvgIconsPlugin {
  constructor(
    private opts: AngularSvgIconsOptions
  ) {}

  apply(compiler: Compiler) {
    compiler.hooks.environment.tap(pluginName,
      () => {
        const angularCompilerPlugin = (compiler.options.plugins || [])
          .find(plugin =>
            plugin.constructor.name === 'AngularCompilerPlugin'
          ) as AngularCompilerPlugin;

        if (!angularCompilerPlugin) {
          // Loader should be used in JIT mode
          return;
        }

        // @ts-ignore: accessing private property
        angularCompilerPlugin._transformers.unshift(
          createTransformer(this.opts)
        );
      }
    )
  }
}
