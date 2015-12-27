"use strict";

const path = require('path');
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


const developmentDir = path.join(__dirname, 'development');
const publicDir = path.join(__dirname, 'public');
const sourceStylesDir = path.join(developmentDir, "styles");
const outputStylesDir = path.join(publicDir, "css");
const sourceScriptsDir = path.join(developmentDir, "scripts");
const outputScriptsDir = path.join(publicDir, "js");

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

	//bundler.transform('debowerify');
	//bundler.transform('html-browserify');
	//bundler.transform('glslify');

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

gulp.task('build', clientAppBundle);

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
	]))/*
	.pipe(rename({
		basename: "matterandform",
		suffix: ".min"
	}))*/
	//.pipe(sourcemaps.write('./maps'))
	.pipe(gulp.dest(outputStylesDir))
	//.pipe(notifyOnDone(startTime));
});

gulp.task('browserify', ['build'], function() {
	clientAppBundler.on('update', clientAppBundle);
});

gulp.task('watch', ["browserify"], function() {
	gulp.watch(path.join(sourceStylesDir, "*.scss"), ["sass"]);
	//gulp.start("browserify");
});