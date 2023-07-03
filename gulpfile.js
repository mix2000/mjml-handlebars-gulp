const path = require('path');
const gulp = require('gulp');
const mjml = require('gulp-mjml');
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const fs = require('fs');
const mjmlEngine = require('mjml')
const browserSync = require('browser-sync');
const watch = require('gulp-watch');
const copy = require('gulp-copy');
const del = require('del');
const scpClient = require('scp2');
const mail = require('gulp-mail');
const gulpPngquant = require('gulp-pngquant');

/** Переменные используемые в сборке. */
const variablesPathDevelop = path.join(__dirname, './config/variables.develop.json');
const variablesDevelop = JSON.parse(fs.readFileSync(variablesPathDevelop));
const variablesPathProduction = path.join(__dirname, './config/variables.production.json');
const variablesProduction = JSON.parse(fs.readFileSync(variablesPathProduction));
const variablesPathTest = path.join(__dirname, './config/variables.test.json');
const variablesTest = JSON.parse(fs.readFileSync(variablesPathTest));
const variablesPathConfig = path.join(__dirname, './config/gulp.json');
const gulpConfig = JSON.parse(fs.readFileSync(variablesPathConfig));

/** Сервер. */
const server = browserSync.create();

/** Функция релоуда сервера после изменений. */
function reload(done) {
    server.reload();
    done();
}

/** Запуск сервера. */
function serve(done) {
    server.init({
        server: {
            baseDir: './dist'
        }
    });
    done();
}

/** Функция компиляции сборки. */
function compile(variables) {
    return gulp.src('templates/*.mjml')
        .pipe(handlebars(variables))
        .pipe(rename({extname: '.mjml'}))
        .pipe(gulp.dest('temp'))
        .pipe(mjml(mjmlEngine, {minify: true}))
        .pipe(rename({extname: '.html'}))
        .pipe(gulp.dest('dist'));
}

/** Задача подстановки данных и компиляции девелоп режим. */
gulp.task('compile-develop', function () {
    return compile(variablesDevelop);
});

/** Задача подстановки данных и компиляции test письмо. */
gulp.task('compile-test', function () {
    const resultVariables = {...variablesDevelop, ...variablesTest};
    return compile(resultVariables);
});

/** Задача подстановки данных и компиляции production письмо. */
gulp.task('compile-production', function () {
    const resultVariables = {...variablesDevelop, ...variablesProduction}
    return compile(resultVariables);
});

/**
 * Задача копирования статики без изменения.
 *
 * Подразумевается, что разработчик подготовит сам данные для этого
 */
gulp.task('copy', () => {
    return gulp.src('./static/**/*')
        .pipe(copy('dist'));
});

/** Удаление временной папки temp. */
gulp.task('clean', () => {
    return del(['temp']);
});

/** Задача отслеживания изменения данных шаблоны, переменные, статика. */
gulp.task('watch', () => {
    watch('templates/*.mjml', gulp.series('compile-develop', 'clean', reload));
    watch('config/*.json', gulp.series('compile-develop', 'clean', reload));
    watch('static/**/*', gulp.series('copy', reload));
});


/** Загрузка данных на сервер. */
gulp.task('upload-to-server', (cb) => {
    scpClient.scp('dist', {
        "host": gulpConfig.server.host,
        "port": gulpConfig.server.port,
        "username": gulpConfig.server.username,
        "password": gulpConfig.server.password,
        "path": gulpConfig.server.path,
    }, cb)
});

gulp.task('compress', () => {
    return gulp.src('dist/static/**/*.png')
        .pipe(gulpPngquant({
            quality: '65-80'
        }))
        .pipe(gulp.dest('./dist/static'));
});


/** Функция отправки на почту. */
gulp.task('mail', () => {
    const smtpInfo = {
        auth: {
            user: gulpConfig.email.login,
            pass: gulpConfig.email.password
        },
        host: gulpConfig.email.host,
        secureConnection: true,
        port: gulpConfig.email.port
    };

    return gulp.src(`./dist/${gulpConfig.sendTemplate}`)
        .pipe(mail({
            subject: 'test email [develop]',
            to: gulpConfig.email.to,
            from: `Developer <${gulpConfig.email.login}>`,
            smtp: smtpInfo
        }));
});

/** Задача отправки шаблона на почту. */
gulp.task('send-email', gulp.series('compile-test', 'copy', 'clean', 'compress', 'upload-to-server', 'mail'))

/** Задача сборки шаблона. */
// Create a build task
gulp.task('build', gulp.series('compile-production', 'copy', 'clean'));

/** Задача запуска сервера и режим разработки. */
gulp.task('serve', gulp.series('compile-develop', 'clean', 'copy', serve, 'watch'));

