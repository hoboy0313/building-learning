import gulp from 'gulp';
import babel from 'gulp-babel';

// 测试 button
gulp.task('build-button', () => {
    return gulp
        .src([
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
                ],
            })
        )
        .pipe(
            gulp.dest('es/components/button')
        );
});
