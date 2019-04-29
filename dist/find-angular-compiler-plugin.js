"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findAngularCompilerPlugin(plugins) {
    return plugins.find(plugin => plugin.constructor.name === 'AngularCompilerPlugin');
}
exports.findAngularCompilerPlugin = findAngularCompilerPlugin;
