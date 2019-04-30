import * as webpack from 'webpack';
import * as fs from 'fs';
import * as ts from 'typescript';
import {
  getOptions,
  stringifyRequest
} from 'loader-utils';
import {promisify} from 'util';
import {getComponentTemplateUrl} from './get-component-template-url';
import {getIconPathsFromTemplate} from './get-icon-paths-from-template';
import {parseIconMatchers} from './parse-icon-matchers';
import {
  AngularSvgIconsOptions,
  IconMatcher
} from './types';
import {findAngularCompilerPlugin} from './find-angular-compiler-plugin';
import {AngularSvgIconsPlugin} from './plugin';
import {resolveComponentTemplateUrl} from './resolve-component-template-url';

const readFile = promisify(fs.readFile);

export default async function angularSvgIconsLoader(
  this: webpack.loader.LoaderContext,
  content: string
): Promise<void> {
  const context = this;
  const callback = context.async() as webpack.loader.loaderCallback;
  const opts: Required<AngularSvgIconsOptions> = {
    iconMatchers: ['<app-svg-icon iconId>'],
    ...getOptions(context) as AngularSvgIconsOptions
  };

  if (context.cacheable) {
    context.cacheable(true);
  }

  const plugins: webpack.Plugin[] = context._compiler.options.plugins || [];
  const angularCompilerPlugin = findAngularCompilerPlugin(plugins);
  const svgIconsPlugin = plugins.find(plugin => plugin instanceof AngularSvgIconsPlugin);

  if (angularCompilerPlugin) {
    if (svgIconsPlugin) {
      return callback(null, content);
    } else {
      return callback(
        new Error(`You need to use "AngularSvgIconsPlugin" in AoT`)
      );
    }
  }

  let iconMatchers: IconMatcher[];

  try {
    iconMatchers = parseIconMatchers(opts.iconMatchers);
  } catch (err) {
    return callback(err);
  }

  let templateFilePath = getTemplateUrl(context.resourcePath, content);

  if (!templateFilePath) {
    return callback(null, content);
  }

  templateFilePath = resolveComponentTemplateUrl(context.resourcePath, templateFilePath);

  if (!fs.existsSync(templateFilePath)) {
    return callback(null, content);
  }

  context.addDependency(templateFilePath);

  const template = await readFile(templateFilePath, 'utf8');

  let iconPaths: string[];
  try {
    iconPaths = getIconPathsFromTemplate(template, templateFilePath, iconMatchers, opts);
  } catch (err) {
    return callback(err);
  }

  let svgImports: string = '';

  for (const iconPath of iconPaths) {
    svgImports += `import ${stringifyRequest(context, iconPath)};\n`;
  }

  return callback(null, `${svgImports}${content}`);
}

function getTemplateUrl(componentFilePath: string, source: string): string | undefined {
  const sourceAst = ts.createSourceFile(
    componentFilePath,
    source,
    ts.ScriptTarget.Latest,
    true
  );

  return getComponentTemplateUrl(sourceAst);
}
