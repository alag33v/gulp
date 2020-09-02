const { src, dest, parallel, series, watch } = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const scss = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cleancss = require('gulp-clean-css')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const del = require('del')

// Styles

const styles = () => {
  return src('app/scss/style.scss')
    .pipe(scss()) // Преобразуем файл из scss в css
    .pipe(concat('style.min.css')) // Происходит конкатенация в один файл
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Добавляем вендорные префиксы
    .pipe(cleancss(({ level: { 1: { specialComments: 0 } } }))) // Сжимается файл в одну строку
    .pipe(dest('app/css/'))  // Выгрузка файла
    .pipe(browserSync.stream()) // Говорим чтобы browserSync следил за изменениями
}
exports.styles = styles

// Scripts

const scripts = () => {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'app/js/app.js'
  ])
    .pipe(concat('app.min.js')) // Происходит конкатенация в один файл
    .pipe(uglify()) // Сжимается файл в одну строку
    .pipe(dest('app/js')) // Выгрузка файла
    .pipe(browserSync.stream()) // Говорим чтобы browserSync следил за изменениями
}
exports.scripts = scripts

// Images

const images = () => {
  return src('app/images/before/**/*')
    .pipe(newer('app/images/after')) // Поиск оптимизированных картинок
    .pipe(imagemin()) // Оптимизация изображений
    .pipe(dest('app/images/after'))
}
exports.images = images

const cleanImages = () => {
  return del('app/images/after/**/*', { force: true }) // Удаляем все содержимое из папки after
}
exports.cleanImages = cleanImages

// Server

const browsersync = () => {
  browserSync.init({
    server: { baseDir: 'app' }, // Сервер будет следить за изменениями в папке app
    notify: false // Отключены уведомления
  })
}
exports.browsersync = browsersync

// Watch

const startWatch = () => {
  watch('app/**/*.html').on('change', browserSync.reload) // При изменении в файле html страница перезагружается
  watch(['app/**/**/*', '!app/css/**/*.min.css'], styles) // При изменении в стилях страница перезагружается
  watch(['app/js/**/*.js', '!app/js/**/*.min.js'], scripts) // При изменении в скриптах страница перезагружается
  watch(['app/images/before/**/*'], images) // При изменении в папке с картинками страница перезагружается
}

// App copy to Dist

const buildCopy = () => {
  return src([
    'app/**/*.html',
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/images/after/**/*'
  ], { base: 'app' })
    .pipe(dest('dist')) // Копируем готовые файлы из app в папку dist
}

const cleanDist = () => {
  return del('dist/**/*', { force: true }) // Удаляем все содержимое из папки dist
}
exports.cleanDist = cleanDist
exports.build = series(cleanDist, styles, scripts, images, buildCopy)

// Default

exports.default = parallel(styles, scripts, browsersync, startWatch)