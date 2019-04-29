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
const path_1 = require("path");
function getIconIdsFromTemplate(template, templateFilePath, matchers) {
    const icons = new Set();
    const $ = cheerio.load(template);
    for (const [tagName, attrName] of matchers) {
        const svgComponents = $(`${tagName}[${attrName}]`);
        for (const svgComponent of svgComponents.toArray()) {
            const iconId = svgComponent.attribs[attrName.toLowerCase()];
            if (iconId.includes('{{')) {
                throw new Error(`Template "${path_1.basename(templateFilePath)}" contains <${tagName}/> component that has interpolation in it's ` +
                    `"${attrName}" attribute that is not supported: "${iconId}"`);
            }
            icons.add(iconId);
        }
    }
    return [...icons];
}
exports.getIconIdsFromTemplate = getIconIdsFromTemplate;
