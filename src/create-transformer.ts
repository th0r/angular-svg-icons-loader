import {relative, dirname} from 'path';
import {readFileSync} from 'fs';
import * as ts from 'typescript';
import {getComponentTemplateUrl} from './get-component-template-url';
import {getIconPathsFromTemplate} from './get-icon-paths-from-template';
import {urlToRequest} from 'loader-utils';
import {parseIconMatchers} from './parse-icon-matchers';
import {AngularSvgIconsOptions} from './types';
import {resolveComponentTemplateUrl} from './resolve-component-template-url';

export function createTransformer(opts: AngularSvgIconsOptions): ts.TransformerFactory<ts.SourceFile> {
  const iconMatchers = parseIconMatchers(opts.iconMatchers);

  return function angularSvgIconsTransformerFactory({factory}: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
    return function angularSvgIconsTransformer(source: ts.SourceFile) {
      const templateUrl = getComponentTemplateUrl(source);

      if (!templateUrl) {
        return source;
      }

      const componentDir = dirname(source.fileName);
      const templateFilePath = resolveComponentTemplateUrl(source.fileName, templateUrl);
      const template = readFileSync(templateFilePath, 'utf8');
      const iconPaths = getIconPathsFromTemplate(template, templateFilePath, iconMatchers, opts);
      const importNodes: ts.ImportDeclaration[] = [];

      for (const iconPath of iconPaths) {
        const importPath = relative(componentDir, iconPath);
        const importDeclaration = factory.createImportDeclaration(undefined, undefined, undefined,
          factory.createStringLiteral(urlToRequest(importPath))
        );
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
  }
}
