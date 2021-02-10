import {Compiler} from 'webpack';
import {createTransformer} from './create-transformer';
import {AngularSvgIconsOptions} from './types';
import {
  findAngularCompilerPlugin,
  findAngularWebpackPlugin
} from './find-angular-compiler-plugin';

const pluginName = 'AngularSvgIconsPlugin';

export class AngularSvgIconsPlugin {
  constructor(
    private opts: AngularSvgIconsOptions
  ) {}

  apply(compiler: Compiler) {
    compiler.hooks.environment.tap(pluginName,
      () => {
        const {opts} = this;
        const angularCompilerPlugin = findAngularCompilerPlugin(compiler.options.plugins);
        const angularWebpackPlugin = findAngularWebpackPlugin(compiler.options.plugins);

        if (angularCompilerPlugin) {
          // @ts-ignore: accessing private property
          angularCompilerPlugin._transformers.unshift(
            createTransformer(opts)
          );
        } else if (angularWebpackPlugin) {
          // @ts-ignore: accessing private property
          const originalCreateFileEmitter = angularWebpackPlugin.createFileEmitter;
          // @ts-ignore: accessing private property
          angularWebpackPlugin.createFileEmitter = function (...args: any[]) {
            const transformers = args[1];
            transformers.before.unshift(
              createTransformer(opts)
            );
            return originalCreateFileEmitter.apply(this, args);
          }
        } else {
          // Loader should be used in JIT mode
          return;
        }
      }
    )
  }
}
