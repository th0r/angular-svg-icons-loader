export type IconMatcher = [
  // Component tagName
  string,
  // iconId attribute
  string
];

export interface AngularSvgIconsOptions {
  // Function that must return an *absolute* path to the icon by its ID.
  // It may also return `null` or `undefined` to ignore this icon and and don't add and `import` statement for it.
  iconFilePathById: (iconId: string) => string | undefined | null;
  // List of icon matchers. Each of them should be a string in the following format: <component-name attr-name>.
  // E.g. "<app-svg-icon iconId>" matcher will search for `app-svg-icon` components and get icon ID from its
  // `iconId` attributes.
  iconMatchers: string[];
}
