import * as cheerio from 'cheerio';
import {IconMatcher} from './types';
import {basename} from 'path';

export function getIconIdsFromTemplate(
  template: string,
  templateFilePath: string,
  matchers: IconMatcher[]
): string[] {
  const icons = new Set<string>();
  const $ = cheerio.load(template);

  for (const [tagName, attrName] of matchers) {
    const svgComponents = $(`${tagName}[${attrName}]`);

    for (const svgComponent of svgComponents.toArray()) {
      const iconId = svgComponent.attribs[attrName.toLowerCase()];

      if (iconId.includes('{{')) {
        throw new Error(
          `Template "${basename(templateFilePath)}" contains <${tagName}/> component that has interpolation in it's ` +
          `"${attrName}" attribute that is not supported: "${iconId}"`
        );
      }

      icons.add(iconId);
    }
  }

  return [...icons];
}
