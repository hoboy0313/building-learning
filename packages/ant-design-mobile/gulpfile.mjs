import path from 'node:path';
import gulp from 'gulp';
import babel from 'gulp-babel';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import merge2 from 'merge2';
import ts from 'gulp-typescript';

import transformless2css from './build/babel-transform-less-to-css.mjs';
import postcssReplaceRootToHost from './build/postcss-replace-root-to-host.mjs';

import tsConfig from './tsconfig.build.json' assert { type: 'json' };

// 测试用的
import './gulpfile.test.mjs';

const tsDefaultReporter = ts.reporter.defaultReporter();

const dirname = path.dirname(new URL(import.meta.url).pathname);

const esDir = path.resolve(dirname, 'es');
const cjsDir = path.resolve(dirname, 'lib');

function compile(modules) {
    const isES = modules === false;
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
                    ['@babel/preset-env', {
                        modules: isES ? false : 'cjs',
                    }],
                ],
                plugins: [
                    [
                        '@babel/plugin-transform-runtime', {
                            useESModules: isES,
                            version: '^7.22.10',
                        },
                    ],
                    ['@babel/plugin-transform-typescript', {
                        isTSX: true,
                    }],
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

gulp.task(
    'compile',
    gulp.parallel(
        'compile-es',
        'compile-cjs'
    )
);
