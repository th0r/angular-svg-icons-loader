import * as cheerio from 'cheerio';
import {
  AngularSvgIconsOptions,
  IconMatcher
} from './types';
import {basename} from 'path';

export function getIconPathsFromTemplate(
  template: string,
  templateFilePath: string,
  matchers: IconMatcher[],
  iconFilePathGetter: AngularSvgIconsOptions['iconFilePathById']
): string[] {
  const iconPaths = new Set<string>();
  const $ = cheerio.load(template);

  for (const [tagName, attrName] of matchers) {
    const svgComponents = $(`${tagName}[${attrName}]`);

    for (const svgComponent of svgComponents.toArray()) {
      const iconId = svgComponent.attribs[attrName.toLowerCase()];
      const iconPath = iconFilePathGetter(iconId);

      if (!iconPath) {
        continue;
      }

      if (iconId.includes('{{')) {
        throw new Error(
          `Template "${basename(templateFilePath)}" contains <${tagName}/> component that has interpolation in it's ` +
          `"${attrName}" attribute that is not supported: "${iconId}"`
        );
      }

      iconPaths.add(iconPath);
    }
  }

  return [...iconPaths];
}
