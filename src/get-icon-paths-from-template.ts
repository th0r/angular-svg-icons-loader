import {sync as glob} from 'fast-glob';
import {
  AngularSvgIconsOptions,
  IconMatcher
} from './types';
import {basename} from 'path';
import {parse as parseJs} from 'acorn';
import {Element, load as parseHtml} from 'cheerio';

export function getIconPathsFromTemplate(
  template: string,
  templateFilePath: string,
  matchers: IconMatcher[],
  opts: Pick<AngularSvgIconsOptions, 'iconFilePath' | 'ignoreIconIds'>
): string[] {
  const iconPaths = new Set<string>();
  const $ = parseHtml(template);
  const ignorePatterns = (opts.ignoreIconIds || []).map(str => new RegExp(str));

  for (let [tagName, attrName] of matchers) {
    attrName = attrName.toLowerCase();
    const boxedAttrName = `[${attrName}]`;
    const matchedElems = $<Element, string>(tagName);

    for (const elem of matchedElems) {
      const attrs = elem.attribs;

      if (attrs[attrName]) {
        const iconId = attrs[attrName];

        if (iconId.startsWith('{{') && iconId.endsWith('}}')) {
          throw new Error(
            `Template "${basename(templateFilePath)}" contains <${tagName}/> component with very greedy ` +
            `"${attrName}" attribute: "${iconId}". Add some prefix or postfix to it to ensure that only needed icons ` +
            `are included.`
          );
        }

        if (isIgnoredIcon(iconId, ignorePatterns)) {
          continue;
        }

        for (const path of expandIconPath(getIconPath(opts.iconFilePath, iconId))) {
          iconPaths.add(path);
        }
      } else if (attrs[boxedAttrName]) {
        const iconIdExpression = attrs[boxedAttrName];
        let ast: any;

        try {
          ast = parseJs(iconIdExpression, {ecmaVersion: 'latest'});
        } catch (err) {
          continue;
        }

        const firstNode = ast.body[0];

        /**
         * Checking for simple conditional expressions like:
         *   `<expression> ? 'iconId1' : 'iconId2'`
         *   `<expression> ? 'iconId1' : null
         *   `<expression> ? undefined : 'iconId2'
         */
        if (
          firstNode?.type === 'ExpressionStatement' &&
          firstNode.expression.type === 'ConditionalExpression' &&
          firstNode.expression.consequent.type === 'Literal' &&
          (typeof firstNode.expression.consequent.value === 'string' || firstNode.expression.consequent.value == null) &&
          firstNode.expression.alternate.type === 'Literal' &&
          (typeof firstNode.expression.alternate.value === 'string' || firstNode.expression.alternate.value == null)
        ) {
          const iconIds = [
            firstNode.expression.consequent.value,
            firstNode.expression.alternate.value
          ].filter(Boolean);

          for (const iconId of iconIds) {
            if (isIgnoredIcon(iconId, ignorePatterns)) {
              continue;
            }

            iconPaths.add(getIconPath(opts.iconFilePath, iconId));
          }
        }
      }
    }
  }

  return [...iconPaths];
}

function expandIconPath(iconPath: string): string[] {
  if (!iconPath.includes('{{')) {
    return [iconPath];
  }

  const iconsGlob = iconPath.replace(/{{.+?}}/g, '*');

  return glob(iconsGlob, {absolute: true});
}

function getIconPath(pathTemplate: string, iconId: string): string {
  return pathTemplate.replace(/\[id]/g, iconId);
}

function isIgnoredIcon(iconId: string, ignorePatterns: RegExp[]): boolean {
  return ignorePatterns.some(pattern => pattern.test(iconId));
}
