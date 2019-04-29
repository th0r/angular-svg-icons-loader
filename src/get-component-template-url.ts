import * as ts from 'typescript';
const {ClassDeclaration} = ts.SyntaxKind;

export function getComponentTemplateUrl(source: ts.SourceFile): string | undefined {
  for (const node of source.statements) {
    if (
      node.kind === ClassDeclaration &&
      node.decorators &&
      node.decorators.length
    ) {
      const componentDecorator = node.decorators.find(isComponentDecorator);

      if (componentDecorator) {
        return getTemplateUrlFromComponentDecorator(componentDecorator);
      }
    }
  }
}

function isComponentDecorator(decorator: ts.Decorator): boolean {
  return (
    decorator.expression.kind === ts.SyntaxKind.CallExpression &&
    (decorator.expression as ts.CallExpression).expression.kind === ts.SyntaxKind.Identifier &&
    ((decorator.expression as ts.CallExpression).expression as ts.Identifier).text === 'Component'
  );
}

function getTemplateUrlFromComponentDecorator(decorator: ts.Decorator): string | undefined {
  const componentOptionsObject = (decorator.expression as ts.CallExpression).arguments[0];

  if (!componentOptionsObject || componentOptionsObject.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
    return;
  }

  const templateUrlProperty: ts.PropertyAssignment | undefined =
    (componentOptionsObject as ts.ObjectLiteralExpression).properties.find(prop =>
      prop.kind === ts.SyntaxKind.PropertyAssignment &&
      prop.name.kind === ts.SyntaxKind.Identifier &&
      prop.name.text === 'templateUrl' &&
      prop.initializer.kind === ts.SyntaxKind.StringLiteral
    ) as ts.PropertyAssignment;

  if (!templateUrlProperty) {
    return;
  }

  return (templateUrlProperty.initializer as ts.Identifier).text;
}

