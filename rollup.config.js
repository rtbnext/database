import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import prettier from 'rollup-plugin-prettier';

export default {
    input: [ 'src/index.ts' ],
    output: [ {
        dir: 'dist',
        format: 'esm',
        entryFileNames: '[name].js',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true
    } ],
    plugins: [
        resolve(),
        typescript( {
            tsconfig: './tsconfig.json'
        } ),
        terser( {
            format: { comments: false },
            compress: false
        } ),
        prettier( {
            parser: 'babel',
            tabWidth: 2,
            bracketSpacing: true,
            bracketSameLine: true,
            singleQuote: true,
            jsxSingleQuote: true,
            trailingComma: 'none',
            objectWrap: 'collapse',
        } )
    ]
};
