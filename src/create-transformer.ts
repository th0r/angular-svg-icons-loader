import {relative, resolve, dirname} from 'path';
import {readFileSync} from 'fs';
import * as ts from 'typescript';
import {getComponentTemplateUrl} from './get-component-template-url';
import {getIconIdsFromTemplate} from './get-icon-ids-from-template';
import {AngularSvgIconsLoaderOptions} from './loader';
import {urlToRequest} from 'loader-utils';

export function createTransformer(opts: AngularSvgIconsLoaderOptions): ts.TransformerFactory<ts.SourceFile> {
  return function angularSvgIconsTransformerFactory(): ts.Transformer<ts.SourceFile> {
    const componentRegexp = /\.component\.ts$/;

    const angularSvgIconsTransformer: ts.Transformer<ts.SourceFile> = (source: ts.SourceFile) => {
      if (!componentRegexp.test(source.fileName)) {
        return source;
      }

      const templateUrl = getComponentTemplateUrl(source);

      if (!templateUrl) {
        return source;
      }

      const componentDir = dirname(source.fileName);
      const templateFilePath = resolve(componentDir, templateUrl);
      const template = readFileSync(templateFilePath, 'utf8');
      const iconIds = getIconIdsFromTemplate(template, [['app-svg-icon', 'iconId']]);
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
