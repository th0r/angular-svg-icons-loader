import * as webpack from 'webpack';
import {
  getOptions,
  stringifyRequest
} from 'loader-utils';
import * as fs from 'fs';
import * as ts from 'typescript';
import {promisify} from 'util';
import {getComponentTemplateUrl} from './get-component-template-url';
import {getIconIdsFromTemplate} from './get-icon-ids-from-template';
import {parseIconMatchers} from './parse-icon-matchers';
import {
  AngularSvgIconsOptions,
  IconMatcher
} from './types';
import {findAngularCompilerPlugin} from './find-angular-compiler-plugin';
import {AngularSvgIconsPlugin} from './plugin';

const readFile = promisify(fs.readFile);

export default async function angularSvgIconsLoader(this: webpack.loader.LoaderContext, content: string): Promise<void> {
  const context = this;
  const callback = context.async() as webpack.loader.loaderCallback;
  const opts: Required<AngularSvgIconsOptions> = {
    iconMatchers: ['<app-svg-icon iconId>'],
    ...getOptions(context) as AngularSvgIconsOptions
  };

  if (context.cacheable) {
    context.cacheable(true);
  }

  const plugins: webpack.Plugin[] = context._compilation.options.plugins;
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

  let templateFilePath = getTemplateUrl(context.resource, content);

  if (!templateFilePath) {
    return callback(null, content);
  }

  const resolveRequest = promisify(context.resolve.bind(context, context.context));

  templateFilePath = await resolveRequest(templateFilePath);

  if (!templateFilePath || !fs.existsSync(templateFilePath)) {
    return callback(null, content);
  }

  context.addDependency(templateFilePath);

  const template = await readFile(templateFilePath, 'utf8');
  const iconIds = getIconIdsFromTemplate(template, templateFilePath, iconMatchers);
  const svgImports = iconIds.map(iconId =>
    `import ${stringifyRequest(context, opts.iconFilePathById(iconId))};\n`
  );

  return callback(null, `${svgImports.join('')}${content}`);
}

function getTemplateUrl(filePath: string, source: string): string | undefined {
  const sourceAst = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true
  );

  return getComponentTemplateUrl(sourceAst);
}
