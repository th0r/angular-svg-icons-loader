import * as cheerio from 'cheerio';

export type IconMatcher = [
  // Component tagName
  string,
  // iconId attribute
  string
];

export function getIconIdsFromTemplate(template: string, matchers: IconMatcher[]): string[] {
  const icons = new Set<string>();
  const $ = cheerio.load(template);

  for (const [tagName, attrName] of matchers) {
    const svgComponents = $(`${tagName}[${attrName}]`);

    for (const svgComponent of svgComponents.toArray()) {
      const iconId = svgComponent.attribs[attrName.toLowerCase()];
      icons.add(iconId);
    }
  }

  return [...icons];
}
