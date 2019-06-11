var gulp          = require('gulp'),
		sass          = require('gulp-sass'),
		browserSync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify-es').default,
		cleancss      = require('gulp-clean-css'),
		autoprefixer  = require('gulp-autoprefixer'),
		rsync         = require('gulp-rsync'),
		imageResize   = require('gulp-image-resize'),
		imagemin      = require('gulp-imagemin'),
		mozjpeg       = require('imagemin-mozjpeg'),
		newer         = require('gulp-newer'),
		rename        = require("gulp-rename"),
		del           = require('del');

// Local Server
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});
function bsReload(done) {
	browserSync.reload();
	done();
};

// Styles & CSS Libraries
gulp.task('styles', function() {
	return gulp.src([
		'node_modules/normalize.css/normalize.css',
		'app/sass/**/*.sass'
	])
	.pipe(sass({ outputStyle: 'expanded' }))
	.pipe(concat("styles.min.css"))
	.pipe(autoprefixer({
		grid: true,
		overrideBrowserslist: ['last 10 versions']
	}))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});

// Scripts & JS Libraries
gulp.task('scripts', function() {
	return gulp.src([
		// 'node_modules/jquery/dist/jquery.min.js', // Optional jQuery
		'app/js/_lazy.js', // JS library example
		'app/js/_custom.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

// HTML Live Reload
gulp.task('code', function() {
	return gulp.src('app/**/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

// Deploy
gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Included files
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excluded files
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

// Images @1x & @2x + Compression | Required imagemagick (sudo apt update; sudo apt install imagemagick)
gulp.task('img1x', function() {
	return gulp.src('app/img/_src/**/*.*')
	.pipe(newer('app/img'))
	.pipe(imageResize({ width: '50%', imageMagick: true }))
	.pipe(imagemin([
		imagemin.jpegtran({ progressive: true }),
		mozjpeg({ quality: 90 })
	]))
	.pipe(rename({ suffix: '@1x' }))
	.pipe(gulp.dest('app/img'))
});
gulp.task('img2x', function() {
	return gulp.src('app/img/_src/**/*.*')
	.pipe(newer('app/img'))
	.pipe(imagemin([
		imagemin.jpegtran({ progressive: true }),
		mozjpeg({ quality: 90 })
	]))
	.pipe(rename({ suffix: '@2x' }))
	.pipe(gulp.dest('app/img'))
});
gulp.task('img', gulp.series('img1x', 'img2x', bsReload));

// Clean @*x IMG's
gulp.task('cleanimg', function() {
	return del(['app/img/@*'], { force: true })
});

gulp.task('watch', function() {
	gulp.watch('app/sass/**/*.sass', gulp.parallel('styles'));
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
	gulp.watch('app/*.html', gulp.parallel('code'));
	gulp.watch('app/img/_src/**/*', gulp.parallel('img'));
});

gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch'));