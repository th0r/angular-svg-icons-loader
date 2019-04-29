"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_transformer_1 = require("./create-transformer");
const pluginName = 'AngularSvgIconsPlugin';
class AngularSvgIconsPlugin {
    constructor(opts) {
        this.opts = opts;
    }
    apply(compiler) {
        compiler.hooks.environment.tap(pluginName, () => {
            const angularCompilerPlugin = (compiler.options.plugins || [])
                .find(plugin => plugin.constructor.name === 'AngularCompilerPlugin');
            if (!angularCompilerPlugin) {
                // Loader should be used in JIT mode
                return;
            }
            // @ts-ignore: accessing private property
            angularCompilerPlugin._transformers.unshift(create_transformer_1.createTransformer(this.opts));
        });
    }
}
exports.AngularSvgIconsPlugin = AngularSvgIconsPlugin;
