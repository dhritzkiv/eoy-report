import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import html from "rollup-plugin-html";
import json from "rollup-plugin-json";
//import postcss from "rollup-plugin-postcss";
//import postcssNesting from "postcss-nesting";
//import autoprefixer from "autoprefixer";
//import postcssSorting from "postcss-sorting";
//import cssNano from "cssnano";
import babili from "rollup-plugin-babel-minify";

import {ENVIRONMENT as environment} from "../.env.json";

const path = require("path");

const BUNDLE_NAME = "2017";
const DIRNAME = path.join(process.cwd(), "client");
const PUBLIC_DIR = path.join(DIRNAME, "public");
const ENTRY_FILE_PATH = path.join(DIRNAME, "/development/scripts/app.js");
const DESTINATION_FILE_PATH = path.join(PUBLIC_DIR, "js", `${BUNDLE_NAME}.js`);
const CSS_FILE_PATH = path.join(PUBLIC_DIR, "css", `${BUNDLE_NAME}.css`);

const plugins = [
	/*postcss({
		plugins: [
			postcssNesting(),
			postcssSorting(),
			autoprefixer({
				browsers: [
					"last 1 safari versions",
					"last 1 ff versions",
					"last 1 chrome versions",
					"last 1 opera versions",
					"last 1 edge versions"
				]
			}),
			cssNano({
				autoprefixer: false
			})
		],
		extensions: [".css"],
		sourceMap: true,
		extract: CSS_FILE_PATH
	}),*/
	html({
		htmlMinifierOptions: {
			caseSensitive: false,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			conservativeCollapse: true,
			decodeEntities: true,
			html5: true,
			removeComments: true,
			removeRedundantAttributes: true,
			sortAttributes: true
		},
		include: "**/*.html"
	}),
	html({
		include: ["**/*.svg", "**/*.geojson"]
	}),
	json(),
	nodeResolve({
		jsnext: true,
		main: true,
		browser: true
	}),
	commonjs({
		include: "./node_modules/**"
	}),
	babel({
		exclude: "./node_modules/**",
		extends: path.join(DIRNAME, ".babelrc")
	})
];

if (environment === "production") {
	plugins.push(babili({
		comments: false,
		removeConsole: true,
		removeDebugger: true
	}));
}

const config = {
	input: ENTRY_FILE_PATH,
	output: {
		file: DESTINATION_FILE_PATH,
		format: "iife",
		sourcemap: true,
		name: "app"
	},
	plugins,
	watch: {
		include: "./**"
	}
};

export default config;
