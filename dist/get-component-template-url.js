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
const { ClassDeclaration } = ts.SyntaxKind;
function getComponentTemplateUrl(source) {
    for (const node of source.statements) {
        if (node.kind === ClassDeclaration &&
            node.decorators &&
            node.decorators.length) {
            const componentDecorator = node.decorators.find(isComponentDecorator);
            if (componentDecorator) {
                return getTemplateUrlFromComponentDecorator(componentDecorator);
            }
        }
    }
}
exports.getComponentTemplateUrl = getComponentTemplateUrl;
function isComponentDecorator(decorator) {
    return (decorator.expression.kind === ts.SyntaxKind.CallExpression &&
        decorator.expression.expression.kind === ts.SyntaxKind.Identifier &&
        decorator.expression.expression.text === 'Component');
}
function getTemplateUrlFromComponentDecorator(decorator) {
    const componentOptionsObject = decorator.expression.arguments[0];
    if (!componentOptionsObject || componentOptionsObject.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
        return;
    }
    const templateUrlProperty = componentOptionsObject.properties.find(prop => prop.kind === ts.SyntaxKind.PropertyAssignment &&
        prop.name.kind === ts.SyntaxKind.Identifier &&
        prop.name.text === 'templateUrl' &&
        prop.initializer.kind === ts.SyntaxKind.StringLiteral);
    if (!templateUrlProperty) {
        return;
    }
    return templateUrlProperty.initializer.text;
}
