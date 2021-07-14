import type * as webpack from 'webpack';
import type { AngularCompilerPlugin, ivy } from '@ngtools/webpack';
export declare function findAngularCompilerPlugin(plugins: webpack.Plugin[] | undefined): AngularCompilerPlugin | undefined;
export declare function findAngularWebpackPlugin(plugins: webpack.Plugin[] | undefined): ivy.AngularWebpackPlugin | undefined;
