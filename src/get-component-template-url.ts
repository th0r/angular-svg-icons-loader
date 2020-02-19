import * as ts from 'typescript';

export function getComponentTemplateUrl(source: ts.SourceFile): string | undefined {
  let templateUrl: string | undefined = undefined;

  findTemplateUrl(source);

  return templateUrl;

  function findTemplateUrl(node: ts.Node) {
    if (templateUrl) {
      return;
    }

    if (
      ts.isIdentifier(node) &&
      node.escapedText === 'templateUrl' &&
      ts.isPropertyAssignment(node.parent) &&
      ts.isStringLiteral(node.parent.initializer)
    ) {
      templateUrl = node.parent.initializer.text;
    } else {
      ts.forEachChild(node, findTemplateUrl);
    }
  }
}
