import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import prettier from 'rollup-plugin-prettier';

export default {
    input: [ 'src/index.ts' ],
    external: [
        'axios', 'csv-string', 'deepmerge', 'devtypes', 'i18n-iso-countries',
        'js-sha256', 'us-state-converter', 'yaml'
    ],
    output: [ {
        dir: 'dist',
        format: 'es',
        entryFileNames: '[name].js',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true
    } ],
    plugins: [
        commonjs(),
        resolve(),
        typescript( {
            tsconfig: './tsconfig.json'
        } ),
        prettier( {
            parser: 'babel',
            tabWidth: 2,
            bracketSpacing: true,
            bracketSameLine: true,
            singleQuote: true,
            jsxSingleQuote: true,
            trailingComma: 'none',
            objectWrap: 'collapse'
        } )
    ]
};
