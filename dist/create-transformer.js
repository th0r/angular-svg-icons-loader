"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const ts = __importStar(require("typescript"));
const get_component_template_url_1 = require("./get-component-template-url");
const get_icon_ids_from_template_1 = require("./get-icon-ids-from-template");
const loader_utils_1 = require("loader-utils");
const parse_icon_matchers_1 = require("./parse-icon-matchers");
function createTransformer(opts) {
    const iconMatchers = parse_icon_matchers_1.parseIconMatchers(opts.iconMatchers);
    return function angularSvgIconsTransformerFactory() {
        const angularSvgIconsTransformer = (source) => {
            const templateUrl = get_component_template_url_1.getComponentTemplateUrl(source);
            if (!templateUrl) {
                return source;
            }
            const componentDir = path_1.dirname(source.fileName);
            const templateFilePath = path_1.resolve(componentDir, templateUrl);
            const template = fs_1.readFileSync(templateFilePath, 'utf8');
            const iconIds = get_icon_ids_from_template_1.getIconIdsFromTemplate(template, templateFilePath, iconMatchers);
            const importNodes = iconIds.map(iconId => {
                const importPath = path_1.relative(componentDir, opts.iconFilePathById(iconId));
                const importDeclaration = ts.createImportDeclaration(undefined, undefined, undefined, ts.createLiteral(loader_utils_1.urlToRequest(importPath)));
                importDeclaration.parent = source;
                return importDeclaration;
            });
            source.statements = ts.createNodeArray([
                ...importNodes,
                ...source.statements
            ]);
            return source;
        };
        return angularSvgIconsTransformer;
    };
}
exports.createTransformer = createTransformer;