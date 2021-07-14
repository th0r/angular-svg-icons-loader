import { AngularSvgIconsOptions, IconMatcher } from './types';
export declare function getIconPathsFromTemplate(template: string, templateFilePath: string, matchers: IconMatcher[], opts: Pick<AngularSvgIconsOptions, 'iconFilePath' | 'ignoreIconIds'>): string[];
