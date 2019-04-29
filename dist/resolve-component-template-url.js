"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function resolveComponentTemplateUrl(componentFilePath, templateUrl) {
    const componentDir = path_1.dirname(componentFilePath);
    return path_1.resolve(componentDir, templateUrl);
}
exports.resolveComponentTemplateUrl = resolveComponentTemplateUrl;
