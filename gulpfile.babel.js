import babelify from 'babelify';
import bower from 'main-bower-files';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import concat from 'gulp-concat';
import connect from 'gulp-connect';
import cordovaLib from 'cordova-lib';
import data from 'gulp-data';
import del from 'del';
import gulp from 'gulp';
import nunjucks from 'nunjucks';
import nunjucksCompile from 'gulp-nunjucks';
import nunjucksRender from 'gulp-nunjucks-render';
import plumber from 'gulp-plumber';
import rename from "gulp-rename";
import runSequence from 'run-sequence';
import sass from 'gulp-sass';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import watch from 'gulp-watch';
import wrap from 'gulp-wrap';

let cordova = cordovaLib.cordova.raw;

const APP_PATH = './app',
	WEB_PATH = './.web',
	INTERIM_PATH = './.tmp',
	CORDOVA_PATH = './cordova/www',
	ENV_PATH = './env',
	CHROME_PATH = './chrome/build',
	CHROME_OVERRIDES_PATH = './chrome/overrides',
	CONFIG_PATH = './config',
	BOOTSTRAP_PATH = './bower_components/bootstrap';

const FONTS_BOOTSTRAP_PATH = BOOTSTRAP_PATH + '/fonts';

const STYLESHEETS_APP_PATH = APP_PATH + '/stylesheets',
	JAVASCRIPTS_APP_PATH = APP_PATH + '/javascripts',
	VIEWS_APP_PATH = APP_PATH + '/views',
	TEMPLATES_APP_PATH = APP_PATH + '/templates',
	IMAGES_APP_PATH = APP_PATH + '/images';

const STYLESHEETS_WEB_PATH = WEB_PATH + '/stylesheets',
	JAVASCRIPTS_WEB_PATH = WEB_PATH + '/javascripts',
	IMAGES_WEB_PATH = WEB_PATH + '/images',
	FONTS_WEB_PATH = WEB_PATH + '/fonts';

const RENDER_CONFIG = {
	watch: false,
	tags: {
		blockStart: '<%',
		blockEnd: '%>',
		variableStart: '<$',
		variableEnd: '$>',
		commentStart: '<#',
		commentEnd: '#>'
	}
};

const COMPILE_CONFIG = {
	watch: false
	// tags: {
	// 	blockStart: '<%',
	// 	blockEnd: '%>',
	// 	variableStart: '<$',
	// 	variableEnd: '$>',
	// 	commentStart: '<#',
	// 	commentEnd: '#>'
	// }
};

gulp.task('del-web', function(cb) {
	del([ WEB_PATH + '/*' ], function() {
		cb();
	});
});

gulp.task('del-interim', function(cb) {
	del([ INTERIM_PATH + '/*' ], function() {
		cb();
	});
});

gulp.task('del-cordova', function(cb) {
	del([ CORDOVA_PATH + '/*' ], function() {
		cb();
	});
});

gulp.task('del-chrome', function(cb) {
	del([ CHROME_PATH + '/*' ], function() {
		cb();
	});
});

gulp.task('env', function() {
	return gulp.src(ENV_PATH + '/' + ( process.env.NODE_ENV || 'production' ) + '.json')
		.pipe(plumber())
		.pipe(wrap('this[\'env\'] = <%= contents %>;', {}, { parse: false }))
		//.pipe(uglify())
		.pipe(concat('env.js'))
		.pipe(gulp.dest(JAVASCRIPTS_WEB_PATH));
});

gulp.task('stylesheets', function() {
	return gulp.src(STYLESHEETS_APP_PATH + '/app.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(STYLESHEETS_WEB_PATH));
});

gulp.task('images', function() {
	return gulp.src(IMAGES_APP_PATH + '/**/*')
				.pipe(gulp.dest(IMAGES_WEB_PATH));
});

gulp.task('fonts', function() {
	return gulp.src(FONTS_BOOTSTRAP_PATH + '/**/*')
				.pipe(gulp.dest(FONTS_WEB_PATH));
});

gulp.task('javascript-libs', function() {
	return gulp.src(bower())
				.pipe(plumber())
				.pipe(concat('libs.js'))
				.pipe(gulp.dest(JAVASCRIPTS_WEB_PATH));
});

gulp.task('javascripts', function() {
	return browserify({
			entries: JAVASCRIPTS_APP_PATH + '/app.js',
			debug: false
		})
		.transform(babelify)
		.bundle()
		.on('error', function(err) {
			console.log(err.message);
			console.log(err.codeFrame);
			this.emit('end');
		})
		.pipe(plumber())
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(JAVASCRIPTS_WEB_PATH));
});

gulp.task('views', function() {
	nunjucksRender.nunjucks.configure([ TEMPLATES_APP_PATH ], RENDER_CONFIG);

	return gulp.src(VIEWS_APP_PATH + '/**/*.html')
		.pipe(plumber())
		.pipe(nunjucksRender())
		.pipe(gulp.dest(INTERIM_PATH + '/views'));
});

gulp.task('views-func', [ 'views' ], function() {
	nunjucks.configure([ TEMPLATES_APP_PATH ], COMPILE_CONFIG);

	return gulp.src(INTERIM_PATH + '/views/**/*.html')
		.pipe(plumber())
		.pipe(nunjucksCompile())
		.pipe(concat('ui.views.js'))
		.pipe(gulp.dest(JAVASCRIPTS_WEB_PATH));
});

function renderHtml(stream) {
	nunjucksRender.nunjucks.configure([ TEMPLATES_APP_PATH ], RENDER_CONFIG);

	return stream.pipe(nunjucksRender());
}

function renderFiles(stream, contents) {
	nunjucksRender.nunjucks.configure(null, RENDER_CONFIG);

	return stream.pipe(data(function(file) {
			return contents;
		}))
		.pipe(nunjucksRender());
}

function asyncWrap(name, stream, cb) {
	stream
		.on('end', function() {
			console.log(name + ' finished');
			cb(null);
		})
		.on('error', function() {
			console.log(arguments);
		});
}

gulp.task('index', function() {
	var sources = [
		APP_PATH + '/index.html',
		APP_PATH + '/chrome.html'
	];

	return renderHtml(gulp.src(sources))
		.pipe(gulp.dest(WEB_PATH));
});

gulp.task('move-to-cordova', function() {
	return gulp.src([ WEB_PATH + '/**/*' ])
		.pipe(gulp.dest(CORDOVA_PATH));
});

gulp.task('move-to-chrome', function() {
	return gulp.src([ WEB_PATH + '/**/*' ])
		.pipe(gulp.dest(CHROME_PATH));
});

gulp.task('chrome-overrides', function() {
	return gulp.src([ CHROME_OVERRIDES_PATH + '/**/*' ])
		.pipe(gulp.dest(CHROME_PATH));
});

gulp.task('build-cleanup', function(cb) {
	let deletedFiles = [
		CORDOVA_PATH + '/chrome.html',
		CHROME_PATH + '/index.html'
	];

	del(deletedFiles, function() {
		cb();
	});
});

gulp.task('connect', function(cb) {
	connect.server({
		root: WEB_PATH,
		livereload: true
	});

	cb();
})

gulp.task('livereload', function () {
	return gulp.src( WEB_PATH + '/**/*' )
		.pipe(connect.reload());
});

gulp.task('serve', [ 'del-web', 'del-interim' ], function(cb) {
	runSequence(
		[ 'env', 'stylesheets', 'fonts', 'images', 'javascript-libs', 'javascripts', 'views-func', 'index' ],
		'connect',
		function() {
			watch([ STYLESHEETS_APP_PATH + '/**/*.scss' ], function() { gulp.start('stylesheets'); });
			watch([ IMAGES_APP_PATH + '/**/*' ], function() { gulp.start('images'); });
			watch([ './bower_components/**/*.js' ], function() { gulp.start('javascript-libs'); });

			watch([ ENV_PATH + '/*.json' ], function() { gulp.start('env'); });

			watch([ JAVASCRIPTS_APP_PATH + '/**/*.js' ], function() { gulp.start('javascripts'); });

			watch([ VIEWS_APP_PATH + '/**/*.html', TEMPLATES_APP_PATH + '/**/*.html' ], function() { gulp.start('views-func'); });
			watch([ APP_PATH + '/index.html', TEMPLATES_APP_PATH + '/**/*.html', VIEWS_APP_PATH + '/**/*.html' ], function() { gulp.start('index'); });

			watch([ WEB_PATH + '/**/*' ], function() { gulp.start('livereload'); });

			cb();
		}
	);
});

gulp.task('build', [ 'del-web', 'del-cordova', 'del-interim', 'del-chrome' ], function(cb) {
	runSequence(
		[ 'env', 'stylesheets', 'fonts', 'images', 'javascript-libs', 'javascripts', 'views-func', 'index' ],
		'move-to-cordova',
		'move-to-chrome',
		'chrome-overrides',
		'build-cleanup',
		cb
	);
});
