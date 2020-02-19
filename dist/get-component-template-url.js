"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
function getComponentTemplateUrl(source) {
    let templateUrl = undefined;
    findTemplateUrl(source);
    return templateUrl;
    function findTemplateUrl(node) {
        if (templateUrl) {
            return;
        }
        if (ts.isIdentifier(node) &&
            node.escapedText === 'templateUrl' &&
            ts.isPropertyAssignment(node.parent) &&
            ts.isStringLiteral(node.parent.initializer)) {
            templateUrl = node.parent.initializer.text;
        }
        else {
            ts.forEachChild(node, findTemplateUrl);
        }
    }
}
exports.getComponentTemplateUrl = getComponentTemplateUrl;
