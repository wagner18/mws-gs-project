/*eslint-env node*/
const browserify = require('browserify');

const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const cache = require('gulp-cache');
const connect = require('gulp-connect');
const BrowserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const jasmine = require('gulp-jasmine-phantom');
const imagemin = require('gulp-imagemin');

//import gulp from 'gulp';

gulp.task('default', ['prod']);

function transpile(file) {
	return browserify({
		entries: `./js/${file}`,
		debug: true
	})
		.transform('babelify', { presets: ['env'] })
		.bundle()
		.pipe(source(file))
		.pipe(buffer())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/js'));
}

gulp.task('build', [
	'copy-html',
	'images',
	'styles',
	'linter'
], () => {
	gulp.src('js/sw/index.js')
		.pipe(concat('sw.js'))
		.pipe(gulp.dest('dist/'));

	gulp.src('manifest.json')
		.pipe(gulp.dest('dist/'));

	transpile('main.js');
	transpile('restaurant_info.js');
	transpile('storage.js');
	transpile('dataWorker.js');
});

gulp.task('copy-html', () => {
	gulp.src('./*.html')
		.pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
	gulp.src('img_resp/**/*')
		// Set image resizing (1x 2x ratio)
		.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 6}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: true},
					{cleanupIDs: false}
				]
			})
		]))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('styles', () => {
	return gulp.src('sass/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.on('error', handleError)
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.on('error', handleError)
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

gulp.task('dev', ['build'], () => {
	BrowserSync.init({
		watch: true,
		server: './dist',
		port: 9001
	});

	gulp.watch(['sass/**/*.{scss,css}'], ['styles']);
	gulp.watch('/index.html', ['copy-html']);
	gulp.watch('js/**/*.js', ['linter', 'build']).on('change', BrowserSync.reload);
	gulp.watch('dist/index.html').on('change', BrowserSync.reload);
	gulp.watch('dist/css/**/*.css').on('change', BrowserSync.reload);
});

gulp.task('prod', ['build'], () => {
	connect.server({
		name: 'Production simulation',
		root: './dist',
		host: '0.0.0.0',
		port: 9000,
		livereload: false,
	});
});

gulp.task('tests', () => {
	return gulp.src('tests/spec/mainSpec.js')
		.pipe(jasmine({
			//integration: true, // BUG - JUSTMINE
			vendor: 'js/**/*.js'
		}));
});


function handleError (err) {
	console.log(err.toString());
	process.exit(-1);
}
