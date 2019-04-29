import {IconMatcher} from './types';

export function parseIconMatchers(matchers: string[]): IconMatcher[] {
  return matchers.map(matcher => {
    const [tagName = '', attrName = ''] = (/^<(\S+)\s+(\S+?)>$/.exec(matcher) || []).slice(1);

    if (!tagName || !attrName) {
      throw new TypeError(`Invalid icon matcher: "${matcher}"`);
    }

    return [tagName, attrName];
  })
}
