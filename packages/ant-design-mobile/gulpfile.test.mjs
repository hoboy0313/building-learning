import gulp from 'gulp';
import babel from 'gulp-babel';
import less from 'gulp-less';
import postcss from 'gulp-postcss';

import transformless2css from './build/babel-transform-less-to-css.mjs';
import postcssReplaceRootToHost from './build/postcss-replace-root-to-host.mjs';

// ========================== test command ==========================
// test button
gulp.task('build-button', () => {
    return gulp
        .src([
            'src/components/avatar/**/*.ts',
            'src/components/avatar/**/*.tsx',
            'src/components/button/**/*.ts',
            'src/components/button/**/*.tsx',
        ])
        .pipe(
            babel({
                presets: [
                    '@babel/preset-react',
                    ['@babel/preset-env', {
                        modules: false,
                    }],
                ],
                plugins: [
                    [
                        '@babel/plugin-transform-runtime', {
                            useESModules: true,
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
        .pipe(
            gulp.dest('test/es/components/button')
        );
});

// test :root to host
gulp.task('build-root-to-host', () => {
    return gulp
        .src('src/global/theme-default.less')
        .pipe(
            less()
        )
        .pipe(
            postcss([
                postcssReplaceRootToHost(),
            ])
        )
        .pipe(
            gulp.dest('test/es')
        );
});
