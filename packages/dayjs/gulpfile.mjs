import path from 'node:path';
import gulp from 'gulp';
import babel from 'gulp-babel';
import terser from 'gulp-terser';
import merge2 from 'merge2';

import webpack from 'webpack';
import webpackStream from 'webpack-stream';

import rollupStream from '@rollup/stream';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import terserRollup from '@rollup/plugin-terser';
import babelRollup from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import source from 'vinyl-source-stream';

function resolvePath(dirname) {
    const prevDirname = path.resolve(dirname, '..');
    return {
        dirname: prevDirname,
        filename: path.relative(prevDirname, dirname),
    };
}

gulp.task('compile-umd-by-webpack', () => {
    return gulp
        .src('src/index.js')
        .pipe(
            webpackStream(
                {
                    output: {
                        filename: 'dayjs.webpack.js',
                        library: {
                            type: 'umd',
                            name: 'dayjs',
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
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                },
                webpack
            )
        )
        .pipe(gulp.dest('dist'));
});

gulp.task('compile-umd-by-rollup', () => {
    return rollupStream({
        input: 'src/index.js',
        output: {
            file: 'dayjs.rollup.js',
            format: 'umd',
            name: 'dayjs',
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
            },
        },
        external: ['react', 'react-dom'],
        plugins: [
            nodeResolve(),
            commonjs(),
            terserRollup(),
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
                ],
                exclude: 'node_modules/**',
                extensions: ['js', 'json'],
            }),
        ],
    })
        .pipe(source('dayjs.rollup.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('compile-plugin-with-locale', () => {
    const pluginCompile = gulp.src([
        'src/plugin/**/*.js',
    ])
        .pipe(
            babel({
                plugins: [
                    '@babel/plugin-transform-modules-umd',
                ],
            })
        )
        .pipe(terser())
        .pipe(gulp.dest(file => {
            const {dirname, filename} = resolvePath(file.dirname);
            file.basename = `${filename}.js`;
            file.dirname = dirname;
            return 'plugin';
        }));

    const localeCompile = gulp.src([
        'src/locale/*.js',
    ])
        .pipe(
            babel({
                plugins: [
                    '@babel/plugin-transform-modules-umd',
                ],
            })
        )
        .pipe(terser())
        .pipe(gulp.dest('locale'));

    const copyPluginDts = gulp
        .src('types/plugin/*.d.ts')
        .pipe(gulp.dest('plugin'));

    const copylocaleDts = gulp
        .src('types/locale/*.d.ts')
        .pipe(gulp.dest('locale'));

    const copyIndexDts = gulp
        .src('types/index.d.ts')
        .pipe(gulp.dest('.'));

    return merge2([
        pluginCompile,
        localeCompile,
        copyPluginDts,
        copylocaleDts,
        copyIndexDts,
    ]);
});

gulp.task(
    'compile',
    gulp.series(
        gulp.parallel(
            'compile-umd-by-webpack',
            'compile-umd-by-rollup'
        ),
        'compile-plugin-with-locale'
    )
);
