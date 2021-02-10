"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const ts = __importStar(require("typescript"));
const loader_utils_1 = require("loader-utils");
const util_1 = require("util");
const get_component_template_url_1 = require("./get-component-template-url");
const get_icon_paths_from_template_1 = require("./get-icon-paths-from-template");
const parse_icon_matchers_1 = require("./parse-icon-matchers");
const find_angular_compiler_plugin_1 = require("./find-angular-compiler-plugin");
const plugin_1 = require("./plugin");
const resolve_component_template_url_1 = require("./resolve-component-template-url");
const readFile = util_1.promisify(fs.readFile);
function angularSvgIconsLoader(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = this;
        const callback = context.async();
        const opts = loader_utils_1.getOptions(context);
        if (context.cacheable) {
            context.cacheable(true);
        }
        // If this plugin is used with `thread-loader` then `_compiler` is not available.
        // `AngularCompilerPlugin` doesn't support this case so it can't be AoT.
        if (context._compiler) {
            const plugins = context._compiler.options.plugins || [];
            const angularCompilerPlugin = find_angular_compiler_plugin_1.findAngularCompilerPlugin(plugins);
            const svgIconsPlugin = plugins.find(plugin => plugin instanceof plugin_1.AngularSvgIconsPlugin);
            if (angularCompilerPlugin) {
                // It's an AoT
                if (svgIconsPlugin) {
                    // Don't use loader because everything will be handled by a plugin
                    return callback(null, content);
                }
                else {
                    return callback(new Error(`You need to use "AngularSvgIconsPlugin" in AoT`));
                }
            }
        }
        let iconMatchers;
        try {
            iconMatchers = parse_icon_matchers_1.parseIconMatchers(opts.iconMatchers);
        }
        catch (err) {
            return callback(err);
        }
        let templateFilePath = getTemplateUrl(context.resourcePath, content);
        if (!templateFilePath) {
            return callback(null, content);
        }
        templateFilePath = resolve_component_template_url_1.resolveComponentTemplateUrl(context.resourcePath, templateFilePath);
        if (!fs.existsSync(templateFilePath)) {
            return callback(null, content);
        }
        context.addDependency(templateFilePath);
        const template = yield readFile(templateFilePath, 'utf8');
        let iconPaths;
        try {
            iconPaths = get_icon_paths_from_template_1.getIconPathsFromTemplate(template, templateFilePath, iconMatchers, opts);
        }
        catch (err) {
            return callback(err);
        }
        let svgImports = '';
        for (const iconPath of iconPaths) {
            svgImports += `import ${loader_utils_1.stringifyRequest(context, iconPath)};\n`;
        }
        return callback(null, `${svgImports}${content}`);
    });
}
exports.default = angularSvgIconsLoader;
function getTemplateUrl(componentFilePath, source) {
    const sourceAst = ts.createSourceFile(componentFilePath, source, ts.ScriptTarget.Latest, true);
    return get_component_template_url_1.getComponentTemplateUrl(sourceAst);
}
