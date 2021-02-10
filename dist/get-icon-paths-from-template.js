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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIconPathsFromTemplate = void 0;
const cheerio = __importStar(require("cheerio"));
const fast_glob_1 = require("fast-glob");
const path_1 = require("path");
function getIconPathsFromTemplate(template, templateFilePath, matchers, opts) {
    const iconPaths = new Set();
    const $ = cheerio.load(template);
    const ignorePatterns = (opts.ignoreIconIds || []).map(str => new RegExp(str));
    for (const [tagName, attrName] of matchers) {
        const svgComponents = $(`${tagName}[${attrName}]`);
        for (const svgComponent of svgComponents.toArray()) {
            const iconId = svgComponent.attribs[attrName.toLowerCase()];
            if (ignorePatterns.some(pattern => pattern.test(iconId))) {
                continue;
            }
            const iconPath = opts.iconFilePath.replace(/\[id]/g, iconId);
            if (iconId.startsWith('{{') && iconId.endsWith('}}')) {
                throw new Error(`Template "${path_1.basename(templateFilePath)}" contains <${tagName}/> component with very greedy ` +
                    `"${attrName}" attribute: "${iconId}". Add some prefix or postfix to it to ensure that only needed icons ` +
                    `are included.`);
            }
            for (const path of expandIconPath(iconPath)) {
                iconPaths.add(path);
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
