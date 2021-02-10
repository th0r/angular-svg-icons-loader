"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransformer = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const get_component_template_url_1 = require("./get-component-template-url");
const get_icon_paths_from_template_1 = require("./get-icon-paths-from-template");
const loader_utils_1 = require("loader-utils");
const parse_icon_matchers_1 = require("./parse-icon-matchers");
const resolve_component_template_url_1 = require("./resolve-component-template-url");
function createTransformer(opts) {
    const iconMatchers = parse_icon_matchers_1.parseIconMatchers(opts.iconMatchers);
    return function angularSvgIconsTransformerFactory({ factory }) {
        return function angularSvgIconsTransformer(source) {
            const templateUrl = get_component_template_url_1.getComponentTemplateUrl(source);
            if (!templateUrl) {
                return source;
            }
            const componentDir = path_1.dirname(source.fileName);
            const templateFilePath = resolve_component_template_url_1.resolveComponentTemplateUrl(source.fileName, templateUrl);
            const template = fs_1.readFileSync(templateFilePath, 'utf8');
            const iconPaths = get_icon_paths_from_template_1.getIconPathsFromTemplate(template, templateFilePath, iconMatchers, opts);
            const importNodes = [];
            for (const iconPath of iconPaths) {
                const importPath = path_1.relative(componentDir, iconPath);
                const importDeclaration = factory.createImportDeclaration(undefined, undefined, undefined, factory.createStringLiteral(loader_utils_1.urlToRequest(importPath)));
                // @ts-ignore: see comment below
                importDeclaration.parent = source;
                importNodes.push(importDeclaration);
            }
            // Have to modify existing `source` instead of creating a new one via `factory.createSourceFile` as in this case
            // TS compilation will fail with really strange errors: some string literals will be corrupted for some reason
            // @ts-ignore
            source.statements = factory.createNodeArray([
                ...importNodes,
                ...source.statements
            ]);
            return source;
        };
    };
}
exports.createTransformer = createTransformer;
