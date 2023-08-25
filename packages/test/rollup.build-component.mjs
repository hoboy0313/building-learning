import {defineConfig} from 'rollup';

import {nodeResolve} from '@rollup/plugin-node-resolve';
import scss from 'rollup-plugin-scss';
import postcss from 'postcss';
import commonjs from '@rollup/plugin-commonjs';
import autoprefixer from 'autoprefixer';

const postcssProcessor = postcss([autoprefixer()]);

export default defineConfig({
    input: 'rollup-build-components/index.js',
    output: {
        file: 'dist/rollup-build-components/index.js',
        format: 'umd',
        name: 'my-design',
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        scss({
            fileName: 'index.css',
            processor: css => postcssProcessor.process(css).then(result => result.css),
        }),
    ],
});
