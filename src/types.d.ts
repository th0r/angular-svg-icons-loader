export type IconMatcher = [
  // Component tagName
  string,
  // iconId attribute
  string
];

export interface AngularSvgIconsOptions {
  // Template string that converts icon ID into an *absolute* path to the icon.
  // `[id]` placeholder will be replaced by the icon ID.
  iconFilePath: string;
  // List of icon matchers. Each of them should be a string in the following format: <component-name attr-name>.
  // E.g. "<app-svg-icon iconId>" matcher will search for `app-svg-icon` components and get icon ID from its
  // `iconId` attributes.
  iconMatchers: string[];
  // Strings, containing regexps matching icon IDs that should will be ignored.
  // E.g. '^(data|code)-'
  ignoreIconIds?: string[];
}
