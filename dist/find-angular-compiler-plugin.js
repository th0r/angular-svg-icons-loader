"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAngularWebpackPlugin = exports.findAngularCompilerPlugin = void 0;
function findAngularCompilerPlugin(plugins) {
    return findWebpackPluginByName(plugins, 'AngularCompilerPlugin');
}
exports.findAngularCompilerPlugin = findAngularCompilerPlugin;
function findAngularWebpackPlugin(plugins) {
    return findWebpackPluginByName(plugins, 'AngularWebpackPlugin');
}
exports.findAngularWebpackPlugin = findAngularWebpackPlugin;
function findWebpackPluginByName(plugins, name) {
    return (plugins || []).find(plugin => plugin.constructor.name === name);
}
