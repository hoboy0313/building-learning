import gulp from 'gulp';

// 测试 button
gulp.task('build-button', () => {
    return gulp
        .src([
            'src/components/button/**/*.ts',
            'src/components/button/**/*.tsx',
        ])
        .pipe(
            gulp.dest('es/components/button')
        );
});
