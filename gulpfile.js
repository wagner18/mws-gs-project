/*eslint-env node*/

const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const cache = require('gulp-cache');
const BrowserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const jasmine = require('gulp-jasmine-phantom');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

//import gulp from 'gulp';

gulp.task('default', ['linter', 'clearCache', 'copy-data', 'copy-html', 'images', 'scripts', 'styles'], () => {

	gulp.watch(['sass/**/*.{scss,css}'], ['styles']);
	gulp.watch('js/**/*.js', ['linter']);
	gulp.watch('/index.html', ['copy-html']);
	gulp.watch('dist/index.html').on('change', BrowserSync.reload);
	gulp.watch('dist/css/**/*.css').on('change', BrowserSync.reload);

	BrowserSync.init({
		server: './dist',
		port: 8000
	});
});

gulp.task('dist', [
	'copy-html',
	'copy-img',
	'styles',
	'linter',
	'scripts-dist'
]);

gulp.task('scripts', () => {
	gulp.src('js/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('scripts-dist', () => {
	gulp.src('js/**/*.js')
		.pipe(babel())
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', () => {
	gulp.src('./index.html')
		.pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
	gulp.src('img_resp/**/*')
		// Set image resizing (1x 2x ratio) 
		.pipe(imagemin({
			progressive: true,
			use: [pngquant()]
		}))
		.pipe(gulp.dest('dist/img_resp'));
});

gulp.task('styles', () => {
	return gulp.src('sass/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(BrowserSync.stream());
});

gulp.task('clearCache', () => {
	cache.clearAll();
	return gulp.src('./**/*')
		.pipe(cache.clear());
});

gulp.task('linter', () => {
	return gulp.src(['js/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format());
	// .pipe(eslint.failOnError());
});

gulp.task('tests', () => {
	return gulp.src('tests/spec/mainSpec.js')
		.pipe(jasmine({
			//integration: true, //BUG
			vendor: 'js/**/*.js'
		}));
});

// const watcher = gulp.watch('sass/**/*.scss', ['default', 'styles']);
// watcher.on('change', (event) => {
// 	console.log(`File ${event.path} was updated - Running tasks`);
// });

// gulp.task("autoprefix", () => {

// });