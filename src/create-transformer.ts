import {relative, resolve, dirname} from 'path';
import {readFileSync} from 'fs';
import * as ts from 'typescript';
import {getComponentTemplateUrl} from './get-component-template-url';
import {getIconIdsFromTemplate} from './get-icon-ids-from-template';
import {urlToRequest} from 'loader-utils';
import {parseIconMatchers} from './parse-icon-matchers';
import {AngularSvgIconsOptions} from './types';
import {resolveComponentTemplateUrl} from './resolve-component-template-url';

export function createTransformer(opts: AngularSvgIconsOptions): ts.TransformerFactory<ts.SourceFile> {
  const iconMatchers = parseIconMatchers(opts.iconMatchers);

  return function angularSvgIconsTransformerFactory(): ts.Transformer<ts.SourceFile> {
    const angularSvgIconsTransformer: ts.Transformer<ts.SourceFile> = (source: ts.SourceFile) => {
      const templateUrl = getComponentTemplateUrl(source);

      if (!templateUrl) {
        return source;
      }

      const componentDir = dirname(source.fileName);
      const templateFilePath = resolveComponentTemplateUrl(source.fileName, templateUrl);
      const template = readFileSync(templateFilePath, 'utf8');
      const iconIds = getIconIdsFromTemplate(template, templateFilePath, iconMatchers);
      const importNodes = iconIds.map(iconId => {
        const importPath = relative(componentDir, opts.iconFilePathById(iconId));
        const importDeclaration = ts.createImportDeclaration(undefined, undefined, undefined,
          ts.createLiteral(urlToRequest(importPath))
        );
        importDeclaration.parent = source;
        return importDeclaration;
      });

      source.statements = ts.createNodeArray([
        ...importNodes,
        ...source.statements
      ]);

      return source;
    };

    return angularSvgIconsTransformer;
  }
}
