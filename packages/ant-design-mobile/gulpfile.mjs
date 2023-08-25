import path from 'node:path';
import gulp from 'gulp';
import babel from 'gulp-babel';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import merge2 from 'merge2';
import ts from 'gulp-typescript';

import webpack from 'webpack';
import webpackStream from 'webpack-stream';

import rollupStream from '@rollup/stream';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import babelRollup from '@rollup/plugin-babel';
import postcssRollup from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';
import source from 'vinyl-source-stream';

import transformless2css from './build/babel-transform-less-to-css.mjs';
import postcssReplaceRootToHost from './build/postcss-replace-root-to-host.mjs';

import tsConfig from './tsconfig.build.json' assert { type: 'json' };

// 测试用的
import './gulpfile.test.mjs';

const tsDefaultReporter = ts.reporter.defaultReporter();

const dirname = path.dirname(new URL(import.meta.url).pathname);

const esDir = path.resolve(dirname, 'es');
const cjsDir = path.resolve(dirname, 'cjs');

function compile(modules) {
    const isES = modules !== false;
    const dir = isES ? esDir : cjsDir;

    let error = 0;

    // ts/tsx
    const scriptCompile = gulp.src(['src/**/*.{ts,tsx}'], {
        ignore: ['**/demos/**/*', '**/tests/**/*'],
    })
        .pipe(
            babel({
                presets: [
                    '@babel/preset-react',
                    '@babel/preset-typescript',
                    ['@babel/preset-env', {
                        modules: isES ? false : 'cjs',
                        loose: true,
                        targets: {
                            'chrome': '49',
                            'ios': '9',
                        },
                    }],
                ],
                plugins: [
                    [
                        '@babel/plugin-transform-runtime', {
                            useESModules: isES,
                            version: '^7.22.10',
                        },
                    ],
                    transformless2css(),
                ],
            })
        )
        .pipe(gulp.dest(dir));

    // style
    const styleCompile = gulp
        .src(['src/**/*.less'])
        .pipe(
            less()
        )
        .pipe(
            postcss([
                postcssReplaceRootToHost(), // 这个是项目中使用。这里只是做演示。
            ])
        )
        .pipe(gulp.dest(dir));

    // dts
    const tsResult = gulp.src(['src/**/*.{ts,tsx}'], {
        ignore: ['**/demos/**/*', '**/tests/**/*'],
    }).pipe(
        ts({
            ...tsConfig.compilerOptions,
            paths: {
                ...tsConfig.compilerOptions.paths,
                'react': ['node_modules/@types/react'],
                'rc-field-form': ['node_modules/rc-field-form'],
                '@react-spring/web': ['node_modules/@react-spring/web'],
                '@use-gesture/react': ['node_modules/@use-gesture/react'],
            },
        }, {
            error(e) {
                tsDefaultReporter.error(e);
                error = 1;
            },
            finish: tsDefaultReporter.finish,
        })
    );

    function check() {
        error && process.exit(1);
    }

    tsResult.on('finish', check);
    tsResult.on('end', check);

    const dtsCompile = tsResult.dts.pipe(gulp.dest(dir));

    return merge2([
        scriptCompile,
        styleCompile,
        dtsCompile,
    ]);
}

gulp.task('compile-es', () => compile());

gulp.task('compile-cjs', () => compile(false));

gulp.task('compile-umd-by-webpack', () => {
    return gulp
        .src('es/index.js')
        .pipe(
            webpackStream(
                {
                    output: {
                        filename: 'antd-mobile.webpack.js',
                        library: {
                            type: 'umd',
                            name: 'antdMobile',
                        },
                    },
                    mode: 'production',
                    optimization: {
                        usedExports: true,
                    },
                    performance: {
                        hints: false,
                    },
                    resolve: {
                        extensions: ['.js', '.json'],
                    },
                    module: {
                        rules: [
                            {
                                test: /\.m?js$/,
                                use: {
                                    loader: 'babel-loader',
                                    options: {
                                        'presets': [
                                            [
                                                '@babel/preset-env',
                                                {
                                                    'loose': true,
                                                    'modules': false,
                                                    'targets': {
                                                        'chrome': '49',
                                                        'ios': '9',
                                                    },
                                                },
                                            ],
                                            '@babel/preset-typescript',
                                            '@babel/preset-react',
                                        ],
                                    },
                                },
                            },
                            {
                                test: /\.(png|svg|jpg|gif|jpeg)$/,
                                type: 'asset/inline',
                            },
                            {
                                test: /\.css$/i,
                                use: ['style-loader', 'css-loader'],
                            },
                        ],
                    },
                    externals: [
                        {
                            react: {
                                commonjs: 'react',
                                commonjs2: 'react',
                                amd: 'react',
                                root: 'React',
                            },
                            'react-dom': {
                                commonjs: 'react-dom',
                                commonjs2: 'react-dom',
                                amd: 'react-dom',
                                root: 'ReactDOM',
                            },
                        },
                    ],
                },
                webpack
            )
        )
        .pipe(
            gulp.dest('dist')
        );
});

gulp.task('compile-umd-by-rollup', () => {
    return rollupStream({
        input: 'es/index.js',
        output: {
            file: 'antd-mobile.js',
            format: 'umd',
            name: 'antdMobile',
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
            },
        },
        external: ['react', 'react-dom'],
        plugins: [
            nodeResolve(),
            commonjs(),
            terser(),
            babelRollup({
                babelHelpers: 'bundled',
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            'loose': true,
                            'modules': false,
                            'targets': {
                                'chrome': '49',
                                'ios': '9',
                            },
                        },
                    ],
                    '@babel/preset-typescript',
                    '@babel/preset-react',
                ],
                exclude: 'node_modules/**',
                extensions: ['js', 'tsx', 'ts', 'jsx'],
            }),
            postcssRollup({
                plugins: [
                    postcssReplaceRootToHost(), // 演示专用，组件库中无需使用。
                ],
            }),
        ],
    })
        .pipe(source('antd-mobile.rollup.js'))
        .pipe(
            gulp.dest('dist')
        );
});

gulp.task(
    'compile',
    gulp.series(
        gulp.parallel(
            'compile-es',
            'compile-cjs'
        ),
        gulp.parallel(
            'compile-umd-by-webpack',
            'compile-umd-by-rollup'
        )
    )
);
