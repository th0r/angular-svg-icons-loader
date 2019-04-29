import * as webpack from 'webpack';
import LoaderContext = webpack.loader.LoaderContext;
import {getOptions, stringifyRequest} from 'loader-utils';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as ts from 'typescript';
import loaderCallback = webpack.loader.loaderCallback;
import {promisify} from 'util';
import {basename} from 'path';
import {getComponentTemplateUrl} from './get-component-template-url';
import {getIconIdsFromTemplate} from './get-icon-ids-from-template';

const readFile = promisify(fs.readFile);

export interface AngularSvgIconsLoaderOptions {
  iconFilePathById: (iconId: string) => string;
  iconComponent?: string;
}

export interface ParsedOptions {
  tagName: string;
  attrName: string;
}

export default async function loader(this: LoaderContext, content: string): Promise<void> {
  const context = this;
  const callback = context.async() as loaderCallback;
  const opts: Required<AngularSvgIconsLoaderOptions> = {
    iconComponent: '<app-svg-icon iconId>',
    ...getOptions(context) as AngularSvgIconsLoaderOptions
  };

  if (context.cacheable) {
    context.cacheable(true);
  }

  const [tagName = '', attrName = ''] = (/^<(\S+)\s+(\S+?)>$/.exec(opts.iconComponent) || []).slice(1);

  if (!tagName || !attrName) {
    return callback(
      new TypeError(`Invalid value for "svgComponent" option: "${opts.iconComponent}"`)
    );
  }

  const parsedOpts: ParsedOptions = {tagName, attrName};

  let templateFilePath = getTemplateUrl(context.resource, content);

  if (!templateFilePath) {
    return callback(null, content);
  }

  const resolveRequest = promisify(context.resolve.bind(context, context.context));

  templateFilePath = await resolveRequest(templateFilePath);

  if (!fs.existsSync(templateFilePath)) {
    return callback(null, content);
  }

  // context.addDependency(templateFilePath);

  const template = await readFile(templateFilePath, 'utf8');
  const icons = getIconIdsFromTemplate(template, parsedOpts);
  const $ = cheerio.load(template);
  const svgComponents = $(`${tagName}[${attrName}]`);
  let svgImports = '';

  for (const svgComponent of svgComponents.toArray()) {
    const iconId = svgComponent.attribs[attrName.toLowerCase()];
    const iconFilePath = opts.iconFilePathById(iconId);

    // context.addDependency(iconFilePath);
    svgImports += `import ${stringifyRequest(this, iconFilePath)};\n`;
  }

  debugger;
  const plugin = context._compilation._ngToolsWebpackPluginInstance;

  if (plugin) {
    console.log(
      plugin.getCompiledFile(context.resourcePath).outputText
    );
  }

  return callback(null, svgImports + content);
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
