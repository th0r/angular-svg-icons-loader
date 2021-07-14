"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIconPathsFromTemplate = void 0;
const fast_glob_1 = require("fast-glob");
const path_1 = require("path");
const acorn_1 = require("acorn");
const cheerio_1 = require("cheerio");
function getIconPathsFromTemplate(template, templateFilePath, matchers, opts) {
    const iconPaths = new Set();
    const $ = cheerio_1.load(template);
    const ignorePatterns = (opts.ignoreIconIds || []).map(str => new RegExp(str));
    for (let [tagName, attrName] of matchers) {
        attrName = attrName.toLowerCase();
        const boxedAttrName = `[${attrName}]`;
        const matchedElems = $(tagName);
        for (const elem of matchedElems) {
            const attrs = elem.attribs;
            if (attrs[attrName]) {
                const iconId = attrs[attrName];
                if (iconId.startsWith('{{') && iconId.endsWith('}}')) {
                    throw new Error(`Template "${path_1.basename(templateFilePath)}" contains <${tagName}/> component with very greedy ` +
                        `"${attrName}" attribute: "${iconId}". Add some prefix or postfix to it to ensure that only needed icons ` +
                        `are included.`);
                }
                if (isIgnoredIcon(iconId, ignorePatterns)) {
                    continue;
                }
                for (const path of expandIconPath(getIconPath(opts.iconFilePath, iconId))) {
                    iconPaths.add(path);
                }
            }
            else if (attrs[boxedAttrName]) {
                const iconIdExpression = attrs[boxedAttrName];
                let ast;
                try {
                    ast = acorn_1.parse(iconIdExpression, { ecmaVersion: 'latest' });
                }
                catch (err) {
                    continue;
                }
                const firstNode = ast.body[0];
                // Checking for simple conditional expressions like `<expression> ? 'iconId1' : 'iconId2'`
                if ((firstNode === null || firstNode === void 0 ? void 0 : firstNode.type) === 'ExpressionStatement' &&
                    firstNode.expression.type === 'ConditionalExpression' &&
                    firstNode.expression.consequent.type === 'Literal' &&
                    typeof firstNode.expression.consequent.value === 'string' &&
                    firstNode.expression.alternate.type === 'Literal' &&
                    typeof firstNode.expression.alternate.value === 'string') {
                    const iconIds = [
                        firstNode.expression.consequent.value,
                        firstNode.expression.alternate.value
                    ];
                    for (const iconId of iconIds) {
                        if (isIgnoredIcon(iconId, ignorePatterns)) {
                            continue;
                        }
                        iconPaths.add(getIconPath(opts.iconFilePath, iconId));
                    }
                }
            }
        }
    }
    return [...iconPaths];
}
exports.getIconPathsFromTemplate = getIconPathsFromTemplate;
function expandIconPath(iconPath) {
    if (!iconPath.includes('{{')) {
        return [iconPath];
    }
    const iconsGlob = iconPath.replace(/{{.+?}}/g, '*');
    return fast_glob_1.sync(iconsGlob, { absolute: true });
}
function getIconPath(pathTemplate, iconId) {
    return pathTemplate.replace(/\[id]/g, iconId);
}
function isIgnoredIcon(iconId, ignorePatterns) {
    return ignorePatterns.some(pattern => pattern.test(iconId));
}
