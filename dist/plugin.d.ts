import { Compiler } from 'webpack';
import { AngularSvgIconsOptions } from './types';
export declare class AngularSvgIconsPlugin {
    private opts;
    constructor(opts: AngularSvgIconsOptions);
    apply(compiler: Compiler): void;
}
