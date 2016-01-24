"use strict";

const path = require('path');
const fs = require("fs");
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');
const browserify = require('browserify');
const sass = require("gulp-sass");
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const nano = require("gulp-cssnano");

const developmentDir = path.join(__dirname, 'development');
const publicDir = path.join(__dirname, 'public');
const sourceStylesDir = path.join(developmentDir, "styles");
const outputStylesDir = path.join(publicDir, "css");
const sourceScriptsDir = path.join(developmentDir, "scripts");
const outputScriptsDir = path.join(publicDir, "js");

const uglifyOptions = {
	mangle: true,
	compress: {
		sequences: true,// join consecutive statemets with the “comma operator”
		properties: true,// optimize property access: a["foo"] → a.foo
		dead_code: true,// discard unreachable code
		drop_debugger: true,// discard “debugger” statements
		unsafe: false, // some unsafe optimizations (see below)//default: false
		conditionals: true,// optimize if-s and conditional expressions
		comparisons: true,// optimize comparisons
		evaluate: true,// evaluate constant expressions
		booleans: true,// optimize boolean expressions
		loops: true,// optimize loops
		unused: true,// drop unused variables/functions
		hoist_funs: true,// hoist function declarations
		hoist_vars: false, // hoist variable declarations//default: false
		if_return: true,// optimize if-s followed by return/continue
		join_vars: true,// join var declarations
		cascade: true,// try to cascade `right` into `left` in sequences
		side_effects: true,// drop side-effect-free statements
		warnings: true,
		drop_console: true,
		global_defs: {
			exports: true
		}
	},
	output: {
		indent_start: 0, // start indentation on every line (only when `beautify`)
		indent_level: 4, // indentation level (only when `beautify`)
		quote_keys: false, // quote all keys in object literals?
		space_colon: true,// add a space after colon signs?
		ascii_only: false, // output ASCII-safe? (encodes Unicode characters as ASCII)
		inline_script: false, // escape "</script"?
		width: 128, // informative maximum line width (for beautified output)
		max_line_len: 32000, // maximum line length (for non-beautified output)
		beautify: false, // beautify output?
		//source_map: null,// output a source map
		bracketize: false, // use brackets every time?
		comments: false, // output comments?
		semicolons: true// use semicolons to separate statements?
	}
};

function makeBundler(src) {

	const bundler = watchify(browserify(src, {
		cache: {},
		packageCache: {},
		fullPaths: false,
		debug: true
	}));
	
	bundler.transform('babelify');

	/*bundler.transform('browserify-versionify', {
		filter: /app_.+\.js$/,
		version: require("./package.json").version
	});

	bundler.transform('browserify-versionify', {
		placeholder: '__BUILDDATE__',
		version: (new Date()).toISOString(),
		filter: /app_.+\.js$/
	});*/

	return bundler;
}

function makeBundle(bundler, targetFile) {
	return function bundle() {
		const startTime = process.hrtime();
		return bundler.bundle()
		.on('error', err => console.error(err.message))
		.pipe(source(targetFile))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write("./", {
			addComment: true,
			sourceRoot: "./"//source map points to files relative to the root of this repo.
		}))
		.pipe(gulp.dest(outputScriptsDir))
		//.pipe(notifyOnDone(startTime));
	};
}

const clientAppBundler = makeBundler(path.join(sourceScriptsDir, "app.js"));
const clientAppBundle = makeBundle(clientAppBundler, "moves-gl-2015.min.js");

gulp.task('app-bundle', clientAppBundle);

gulp.task('sass', function() {
	//const startTime = process.hrtime();
	
	const browserSupport = [
		'last 1 versions',
		'last 2 Chrome versions',
		'last 2 Firefox versions',
		'Safari >=8',
		'iOS >= 8',
		'Explorer >= 11'
	];

	return gulp.src(path.join(sourceStylesDir, "main.scss"))
	//.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(postcss([
		//assets(assetsOptions),
		autoprefixer({
			browsers: browserSupport
		})
	]))
	//.pipe(sourcemaps.write('./maps'))
	.pipe(gulp.dest(outputStylesDir))
	//.pipe(notifyOnDone(startTime));
});

gulp.task('browserify', ['app-bundle'], function() {
	clientAppBundler.on('update', clientAppBundle);
});

gulp.task('uglify-js-clients', function() {
	const scriptFiles = fs.readdirSync(outputScriptsDir)
	.filter(name => /\.js$/.test(name))
	.map(name => path.join(outputScriptsDir, name));

	return gulp.src(scriptFiles)
	.pipe(sourcemaps.init({
		loadMaps: true
	}))
	.pipe(uglify(uglifyOptions))
	.pipe(sourcemaps.write("./", {
		addComment: true,
		sourceRoot: "./"
	}))
	.pipe(gulp.dest(outputScriptsDir))
});

gulp.task('minify-css', function() {
	const styleFiles = fs.readdirSync(outputStylesDir)
	.filter(name => /\.css$/.test(name))
	.map(name => path.join(outputStylesDir, name));

	return gulp.src(styleFiles)
	.pipe(nano({
		autoprefixer: false
	}))
	.pipe(gulp.dest(outputStylesDir))
});

gulp.task('build', ['app-bundle', 'sass']);

gulp.task('release', ['minify-css', 'uglify-js-clients']);

gulp.task('watch', ["browserify"], function() {
	gulp.watch(path.join(sourceStylesDir, "*.scss"), ["sass"]);
	//gulp.start("browserify");
});
