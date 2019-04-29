import * as cheerio from 'cheerio';
import {sync as glob} from 'fast-glob';
import {
  AngularSvgIconsOptions,
  IconMatcher
} from './types';
import {basename} from 'path';

export function getIconPathsFromTemplate(
  template: string,
  templateFilePath: string,
  matchers: IconMatcher[],
  opts: AngularSvgIconsOptions
): string[] {
  const iconPaths = new Set<string>();
  const $ = cheerio.load(template);

  for (const [tagName, attrName] of matchers) {
    const svgComponents = $(`${tagName}[${attrName}]`);

    for (const svgComponent of svgComponents.toArray()) {
      const iconId = svgComponent.attribs[attrName.toLowerCase()];
      const iconPath = opts.iconFilePathById(iconId);

      if (!iconPath) {
        continue;
      }

      if (iconId.startsWith('{{') && iconId.endsWith('}}')) {
        throw new Error(
          `Template "${basename(templateFilePath)}" contains <${tagName}/> component with very greedy ` +
          `"${attrName}" attribute: "${iconId}". Add some prefix or postfix to it to ensure that only needed icons ` +
          `are included.`
        );
      }

      for (const path of expandIconPath(iconPath)) {
        iconPaths.add(path);
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
