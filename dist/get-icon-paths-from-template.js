"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const fast_glob_1 = require("fast-glob");
const path_1 = require("path");
function getIconPathsFromTemplate(template, templateFilePath, matchers, opts) {
    const iconPaths = new Set();
    const $ = cheerio.load(template);
    for (const [tagName, attrName] of matchers) {
        const svgComponents = $(`${tagName}[${attrName}]`);
        for (const svgComponent of svgComponents.toArray()) {
            const iconId = svgComponent.attribs[attrName.toLowerCase()];
            const iconPath = opts.iconFilePathById(iconId);
            if (!iconPath) {
                continue;
            }
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
