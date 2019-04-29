export type IconMatcher = [
  // Component tagName
  string,
  // iconId attribute
  string
];

export interface AngularSvgIconsOptions {
  iconFilePathById: (iconId: string) => string;
  iconMatchers: string[];
}
