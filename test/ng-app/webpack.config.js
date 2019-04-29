const {AngularCompilerPlugin} = require('@ngtools/webpack');
const {AngularSvgIconsPlugin} = require('../../dist');

const SRC_ROOT = `${__dirname}/src`;
const SVG_ICONS_ROOT = `${SRC_ROOT}/app/icons`;

module.exports = (env = {}) => {
  const plugins = [];
  const rules = [];

  if (env.jit) {
    rules.push(
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          },
          'angular2-template-loader'
        ]
      }
    );
  } else {
    rules.push(
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: require.resolve('./log-loader'),
            options: {
              id: 'after ngtools',
              filter: /\.component\.ts$/
            }
          },
          '@ngtools/webpack'
        ]
      }
    );

    plugins.push(
      new AngularCompilerPlugin({
        tsConfigPath: './src/tsconfig.app.json'
      }),
      new AngularSvgIconsPlugin({
        iconFilePathById: iconId => `${SVG_ICONS_ROOT}/${iconId}.svg`
      })
    );
  }

  return {
    mode: 'development',
    watch: true,
    resolve: {
      extensions: ['.ts', '.js']
    },
    entry: `${SRC_ROOT}/main.ts`,
    output: {
      path: `${__dirname}/dist`
    },
    optimization: {
      minimize: false
    },
    performance: {
      hints: false
    },
    module: {
      rules: [
        ...rules,
        {
          test: /\.component\.ts$/,
          loaders: [
            /*{
              loader: require.resolve('../../dist/loader'),
              options: {
                iconFilePathById: iconId => `${SVG_ICONS_ROOT}/${iconId}.svg`
              }
            }*/
          ]
        },
        {
          test: /\.(html|css)$/,
          loader: 'raw-loader'
        },
        {
          test: /\.svg$/,
          loader: 'svg-sprite-loader',
          options: {
            symbolId: path =>
              path
                .replace(`${SVG_ICONS_ROOT}/`, '')
                .replace(/\.svg$/, '')
          }
        },
        {
          // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
          // Removes compilation warning 'System.import() is deprecated and will be removed soon. Use import() instead.'
          test: /[\\/]@angular[\\/]core[\\/].+\.js$/,
          parser: {system: true}
        }
      ]
    },
    plugins
  }
};
