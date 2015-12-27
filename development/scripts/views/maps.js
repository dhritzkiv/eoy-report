"use strict";

const View = require("ampersand-view");

const THREE = require("three.js");
const MeshLine = require("../THREE.MeshLine").MeshLine;
const MeshLineMaterial = require("../THREE.MeshLine").MeshLineMaterial;

const RENDER_ORDER_FEATURES = 0;
const RENDER_ORDER_FEATURE_MAP = 0.1;
const RENDER_ORDER_TEXT = 0.2;
const RENDER_ORDER_LINES = 0.3;
const RENDER_ORDER_LINES_RIDES = 0.31;
const RENDER_ORDER_LINES_WALKS = 0.32;
const RENDER_ORDER_PLACES = 0.4;
const RENDER_ORDER_LABELS = 0.5;

const LABEL_SIZE_METRO = 1;
const LABEL_SIZE_SMALL = 0.6;

const COLOR_LAND = "#f1f7f6";
const COLOR_PARKS = "#d8e5e0";
const COLOR_WATER = "#b6d8db";//0x3cf3cf;
const COLOR_TEXT = "#373d3d";

module.exports = View.extend({
	props: {
		city: {
			type: "string",
			default: "to"
		},
		needsRender: {
			type: "boolean",
			default: true
		}
	},
	template: `
		<section id="maps">
			<main>
				<canvas></canvas>
			</main>
			<nav>
				<a href="/maps/to">Toronto</a>
				<a href="/maps/lv">Las Vegas</a>
				<a href="/maps/nyc">New York City</a>
				<a href="/maps/pdx">Portland</a>
				<a href="/maps/van">Vancouver</a>
			</nav>
		</section>
	`,
	initialize: function() {
		
	},
	render: function() {
		this.renderWithTemplate(this);
		
		this.canvas = this.query("canvas");
		
		const renderer = this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			canvas: this.canvas
		});
		
		renderer.setClearColor(COLOR_LAND);
		
		const scene = this.scene = new THREE.Scene();
		const camera = this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.0001, 1);
		
		requestAnimationFrame(() => this.windowResize());
		
		window.addEventListener("resize", () => requestAnimationFrame(() => this.windowResize()));
		
		this.canvasRender();
		
		return this;
	},
	windowResize: function() {
		const renderer = this.renderer;
		const camera = this.camera;
		const rect = this.canvas.parentNode.getBoundingClientRect();
		
		renderer.setPixelRatio(window.devicePixelRatio || 1);
		renderer.setSize(rect.width, rect.height);
		camera.aspect = rect.width / rect.height;
		camera.updateProjectionMatrix();
		
		this.needsRender = true;
	},
	canvasRender: function () {
		requestAnimationFrame(() => this.canvasRender());
		
		if (!this.needsRender) {
			return;
		}
	
		this.renderer.render(this.scene, this.camera);
		this.needsRender = false;
	}
});