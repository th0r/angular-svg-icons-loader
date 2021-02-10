"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularSvgIconsPlugin = void 0;
const create_transformer_1 = require("./create-transformer");
const find_angular_compiler_plugin_1 = require("./find-angular-compiler-plugin");
const pluginName = 'AngularSvgIconsPlugin';
class AngularSvgIconsPlugin {
    constructor(opts) {
        this.opts = opts;
    }
    apply(compiler) {
        compiler.hooks.environment.tap(pluginName, () => {
            const { opts } = this;
            const angularCompilerPlugin = find_angular_compiler_plugin_1.findAngularCompilerPlugin(compiler.options.plugins);
            const angularWebpackPlugin = find_angular_compiler_plugin_1.findAngularWebpackPlugin(compiler.options.plugins);
            if (angularCompilerPlugin) {
                // @ts-ignore: accessing private property
                angularCompilerPlugin._transformers.unshift(create_transformer_1.createTransformer(opts));
            }
            else if (angularWebpackPlugin) {
                // @ts-ignore: accessing private property
                const originalCreateFileEmitter = angularWebpackPlugin.createFileEmitter;
                // @ts-ignore: accessing private property
                angularWebpackPlugin.createFileEmitter = function (...args) {
                    const transformers = args[1];
                    transformers.before.unshift(create_transformer_1.createTransformer(opts));
                    return originalCreateFileEmitter.apply(this, args);
                };
            }
            else {
                // Loader should be used in JIT mode
                return;
            }
        });
    }
}
exports.AngularSvgIconsPlugin = AngularSvgIconsPlugin;
