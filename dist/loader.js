"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
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
        const opts = Object.assign({ iconMatchers: ['<app-svg-icon iconId>'] }, loader_utils_1.getOptions(context));
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
