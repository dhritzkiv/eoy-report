"use strict";

const app = require("ampersand-app");
const View = require("ampersand-view");
const proj4 = require("proj4");
const THREE = require("three");
const TWEEN = require("tween.js");
const async = require("async");
const {MeshLine, MeshLineMaterial} = require("three.meshline");

const MapArea = require("../models/map-area");

const consts = require("../consts");

const performance = window.performance || Date;


const TARGET_FPS = 60;
const TIMESTEP = 1000 / TARGET_FPS;
const MAX_UPDATES_PER_FRAME = 4000 / TIMESTEP;//4 seconds worth of updates
const FRICTION_ON_MOUSE_UP = 0.89;
const ACCELERATION_TO_VELOCITY_PER_TIMESTEP = 1.5 / TIMESTEP;//~0.09 * 16 (timestep)
const ACCELERATION_CAP_MIN = 0.15;

const DECELERATION_RATE = 0.91;
const ACCELERATION_TO_VELOCITY = (1 - DECELERATION_RATE) / DECELERATION_RATE;
//const ACCELERATION_MIN_CAP = 1 - DECELERATION_RATE;
const ACCELERATION_PROPERTIES = ["translationAccelerationX", "translationAccelerationY"];

const getCheckinPointMaterial = () => {
	const pointCanvas = document.createElement("canvas");
	const context = pointCanvas.getContext("2d");
	const pointDimension = 24 * window.devicePixelRatio;
	const pointRadius = pointDimension / 2;
	const pointLineWidth = pointDimension / 4;
	const fullCircle = 2 * Math.PI;

	pointCanvas.width = pointDimension;
	pointCanvas.height = pointDimension;

	context.beginPath();
	context.arc(pointRadius, pointRadius, pointRadius, 0, fullCircle);
	context.fillStyle = consts.COLOR_LAND;
	context.fill();
	context.closePath();
	context.beginPath();
	context.arc(pointRadius, pointRadius, pointRadius - pointLineWidth, 0, fullCircle);
	context.fillStyle = consts.COLOR_CHECKIN_POINT;
	context.fill();
	context.closePath();

	const pointTexture = new THREE.Texture(pointCanvas);

	pointTexture.premultiplyAlpha = true;
	pointTexture.needsUpdate = true;
	pointTexture.magFilter = THREE.LinearFilter;
	pointTexture.minFilter = THREE.LinearFilter;

	const pointMaterial = new THREE.PointsMaterial({
		size: pointCanvas.width / 2,
		map: pointTexture,
		transparent: true,
		sizeAttenuation: false
	});

	pointMaterial.blending = THREE.CustomBlending;
	pointMaterial.blendSrc = THREE.OneFactor;

	pointMaterial.depthWrite = false;

	return pointMaterial;
};

const pointMaterial = getCheckinPointMaterial();

const rideLineMaterial = new MeshLineMaterial({
	lineWidth: 16,//size of individual street
	sizeAttenuation: 1,
	depthTest: true,
	transparent: false,
	color: new THREE.Color(consts.COLOR_LINES_RIDES)
});

//line width can be updated via: material.uniforms.lineWidth.value

/*const walkLineMaterial = new MeshLineMaterial({
	lineWidth: 10,//half size of individual street
	sizeAttenuation: 1,
	depthTest: true,
	transparent: false,
	color: new THREE.Color(consts.COLOR_LINES_WALKS)
});*/

const removeRecursive = (parent) => parent.children
.filter(child => !(child instanceof THREE.Scene))
.forEach(child => {
	removeRecursive(child);
	parent.remove(child);
});

const convertPointForProjection = (toProjection) => (point) => proj4(consts.PROJECTION_WGS84, toProjection, point);

const filterActivitiesToBounds = ([ [minx, miny], [maxx, maxy] ]) => (activity) => {
	let pointOrPoints = activity.points;

	if (!pointOrPoints) {
		pointOrPoints = [activity.point];
	}

	return pointOrPoints.every(([x, y]) => x > minx && x < maxx && y > miny && y < maxy);
};

module.exports = View.extend({
	props: {
		progress: {
			type: "number",
			default: 0
		},
		is_touch: {
			type: "boolean",
			default: () => (("ontouchstart" in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
		},
		data: {
			type: "array"
		}
	},
	children: {
		area: MapArea
	},
	derived: {
		loaded: {
			deps: ["progress"],
			fn: function() {
				return this.progress === 1;
			}
		}
	},
	template: `<canvas class="map" width="640px" height="360px"></canvas>`,
	events: {
		"click [data-hook=legend]": "showLegend",
		"mousewheel canvas": "mousewheelHandler",
		"mousedown canvas": "mousedownHandler",
		"mousemove canvas": "mousemoveHandler",
		"mouseup canvas": "mouseupHandler",
		"touchstart canvas": "touchstartHandler",
		"touchmove canvas": "touchmoveHandler",
		"touchend canvas": "touchendHandler"
	},
	bindings: {
		area_name: {
			type: "attribute",
			name: "data-area",
			selector: "section"
		},
		area_title: [
			{
				type: "attribute",
				name: "data-title",
				selector: "section"
			},
			{
				type: "text",
				selector: "#loading-holder [data-hook=area_name]"
			}
		],
		is_touch: {
			type: "toggle",
			yes: "[data-hook=is_touch]",
			no: "[data-hook=isnt_touch]"
		},
		loaded: {
			type: "toggle",
			no: "#loading-holder"
		},
		progress: {
			type: (el, val) => (el.style.width = `${val * 100 }%`),
			selector: "#loading-holder .progress"
		}
	},
	needsRender: true,
	isMouseDown: false,
	mouseDownX: 0,
	mouseDownY: 0,
	translationVelocityX: 0,
	translationVelocityY: 0,
	translationAccelerationX: 0,
	translationAccelerationY: 0,
	touchesCount: 0,
	lastInteractionTime: 0,
	frameDeltaTime: 0,
	lastFrameTimestamp: 0,
	_rAF: null,
	render: function() {
		this.renderWithTemplate(this);

		const canvas = this.canvas = this.query("canvas");

		const renderer = this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			canvas: canvas,
			alpha: true
		});

		// auto?
		//renderer.setPixelRatio(window.devicePixelRatio || 1);

		const scene = this.scene = new THREE.Scene();
		const aspectRatio = canvas.clientWidth / canvas.clientHeight;

		this.camera = new THREE.PerspectiveCamera(90, aspectRatio, consts.CAMERA_NEAR, 40000);

		requestAnimationFrame(() => this.windowResize());

		window.addEventListener("resize", () => requestAnimationFrame(() => this.windowResize()));

		const boundKeyDownHandler = event => {
			event.delegateTarget = canvas;
			this.keydownHandler.call(this, event);
		};

		document.addEventListener("keydown", boundKeyDownHandler);

		/*this.listenToAndRun(this, "change:area_name", () => {
			removeRecursive(scene);
			this.needsRender = true;

			const area = this.area = new MapArea(areas[this.area_name]);
			this.area_title = area.name;
			requestAnimationFrame(() => this.setUpArea(area));
		});*/

		this.setUpArea(this.area);

		this.canvasRender(performance.now());

		this.once("remove", () => cancelAnimationFrame(this._rAF));

		return this;
	},
	canvasRender: function(timestamp) {
		this._rAF = requestAnimationFrame(() => this.canvasRender(performance.now()));

		TWEEN.update();

		if (!this.needsRender) {
			return;
		}

		const view = this;
		const {camera} = this;

		this.frameDeltaTime += timestamp - this.lastFrameTimestamp;
		this.lastFrameTimestamp = timestamp;

		if (!this.needsRender) {
			//if we're not rendering this frame,
			// nil the accumulated framedelta,
			// as we're not running behind schedule.
			this.frameDeltaTime = TIMESTEP;

			//arguably, this `needsRender` check could be done after
			// the "physics" simulation while loop/ before any of the actual
			// actual drawing calls happen.
			return;
		}

		let numUpdateSteps = 0;
		let xTranslationUnits;
		let yTranslationUnits;

		while (this.frameDeltaTime >= TIMESTEP) {

			if (!this.mouseDown || !view.touchesCount)	{
				xTranslationUnits = this.translationAccelerationX;
				yTranslationUnits = this.translationAccelerationY;
			} else {
				xTranslationUnits = this.translationVelocityX;
				yTranslationUnits = this.translationVelocityY;
			}

			const distanceDampening = 100 / (0.75 * camera.position.z);

			xTranslationUnits /= distanceDampening;
			yTranslationUnits /= distanceDampening;

			xTranslationUnits *= 1;
			yTranslationUnits *= 1;

			camera.position.x += xTranslationUnits;
			camera.position.y += yTranslationUnits;

			view.translationVelocityX = 0;
			view.translationVelocityY = 0;

			ACCELERATION_PROPERTIES.forEach(prop => {

				//Slow the spinning down every frame
				view[prop] *= FRICTION_ON_MOUSE_UP;

				//make sure we're not spinning forever
				if (Math.abs(view[prop]) < ACCELERATION_CAP_MIN) {
					view[prop] = 0;
				}
			});

			this.frameDeltaTime -= TIMESTEP;
			numUpdateSteps++;

			if (numUpdateSteps >= MAX_UPDATES_PER_FRAME) {
				this.frameDeltaTime = TIMESTEP;

				break;
			}
		}

		view.needsRender = ACCELERATION_PROPERTIES.some(prop => Boolean(view[prop]));

		this.renderer.render(this.scene, this.camera);
	},
	windowResize: function() {
		const {renderer, camera} = this;
		const {clientWidth: width, clientHeight: height} = this.canvas.parentNode;

		renderer.setSize(width, height);

		camera.aspect = width / height;

		camera.updateProjectionMatrix();

		this.updateMaxCameraZ();
		this.updateForCameraZ();

		this.needsRender = true;
	},
	mousewheelHandler: function(event) {

		event.preventDefault();

		const camera = this.camera;

		camera.position.z += (event.deltaY * 0.0025) * (camera.position.z / 1.5);

		const minCameraZ = consts.CAMERA_NEAR * 2;
		const maxCameraZ = Math.min(this.max_camera_z, this.camera.far - 10);

		if (camera.position.z < minCameraZ) {
			camera.position.z = minCameraZ;
		} else if (camera.position.z > maxCameraZ) {
			camera.position.z = maxCameraZ;
		}

		this.updateForCameraZ();

		this.needsRender = true;
	},
	mousedownHandler: function(event) {
		this.mouseDown = true;
		this.mouseDownX = event.clientX;
		this.mouseDownY = event.clientY;

		this.translationAccelerationX = 0;
		this.translationAccelerationY = 0;
		this.translationVelocityX = 0;
		this.translationVelocityY = 0;

		this.lastInteractionTime = Date.now();
		this.needsRender = true;

		event.preventDefault();
	},
	mousemoveHandler: function(event) {

		if (!this.mouseDown) {
			return;
		}

		event.preventDefault();

		const changeX = event.clientX - this.mouseDownX;
		const changeY = event.clientY - this.mouseDownY;

		this.mouseDownX = event.clientX;
		this.mouseDownY = event.clientY;

		this.translationVelocityX = -changeX; //negative left
		this.translationVelocityY = changeY; //negative up

		this.translationAccelerationX += this.translationVelocityX * ACCELERATION_TO_VELOCITY_PER_TIMESTEP;
		this.translationAccelerationY += this.translationVelocityY * ACCELERATION_TO_VELOCITY_PER_TIMESTEP;

		this.lastInteractionTime = Date.now();
		this.needsRender = true;
	},
	mouseupHandler: function(event) {
		this.mouseDown = false;
		this.lastInteractionTime = Date.now();
		this.needsRender = true;

		event.preventDefault();
	},
	touchstartHandler: function(event) {
		this.mouseDown = true;
		this.mouseDownX = event.touches[0].clientX;
		this.mouseDownY = event.touches[0].clientY;
		this.touchesCount = event.touches.length;

		if (this.touchesCount === 2) {
			const touch1 = event.touches[0];
			const touch2 = event.touches[1];

			const dx = touch1.clientX - touch2.clientX;
			const dy = touch1.clientY - touch2.clientY;

			this.touchPreviousDistance = Math.sqrt((dx * dx) + (dy * dy));
		}

		this.rotationAccelerationY = 0;
		this.rotationAccelerationX = 0;
		this.rotationVelocityX = 0;
		this.rotationVelocityY = 0;

		this.lastInteractionTime = Date.now();
		this.needsRender = true;

		event.preventDefault();
	},
	touchmoveHandler: function(event) {

		const camera = this.camera;

		//previous touchesCount; might minimize situations where pan mode is triggered when releasing fingers not at the same time
		const touchesCount = this.touchesCount;

		if (touchesCount === 1) {

			const touch = event.touches[0];

			const changeX = touch.clientX - this.mouseDownX;
			const changeY = touch.clientY - this.mouseDownY;

			this.mouseDownX = touch.clientX;
			this.mouseDownY = touch.clientY;

			this.translationVelocityX = -changeX; //negative left
			this.translationVelocityY = changeY; //negative up

			this.translationAccelerationX += this.translationVelocityX * ACCELERATION_TO_VELOCITY_PER_TIMESTEP;
			this.translationAccelerationY += this.translationVelocityY * ACCELERATION_TO_VELOCITY_PER_TIMESTEP;

		} else if (touchesCount === 2) {

			const touch1 = event.touches[0];
			const touch2 = event.touches[1] || touch1;

			const dx = touch1.clientX - touch2.clientX;
			const dy = touch1.clientY - touch2.clientY;

			const distance = Math.sqrt((dx * dx) + (dy * dy));
			const deltaDistance = this.touchPreviousDistance - distance;

			camera.position.z += (deltaDistance * 0.005) * (camera.position.z / 1.5);

			const minCameraZ = consts.CAMERA_NEAR * 2;
			const maxCameraZ = Math.min(this.max_camera_z, this.camera.far - 100);

			if (camera.position.z < minCameraZ) {
				camera.position.z = minCameraZ;
			} else if (camera.position.z > maxCameraZ) {
				camera.position.z = maxCameraZ;
			}

			this.updateForCameraZ();
			this.touchPreviousDistance = distance;

		}

		this.touchesCount = event.touches.length;

		this.lastInteractionTime = Date.now();
		this.needsRender = true;

		event.preventDefault();
	},
	touchendHandler: function(event) {
		this.mouseDown = false;
		this.touchesCount = 0;

		const lastInteractionTime = this.lastInteractionTime;
		const timeSinceLastInteractionTime = Date.now() - lastInteractionTime;

		for (let i = 0; i < Math.ceil(timeSinceLastInteractionTime / 16); i++) {
			this.translationAccelerationX *= DECELERATION_RATE;
			this.translationAccelerationY *= DECELERATION_RATE;
		}

		this.lastInteractionTime = Date.now();
		this.needsRender = true;

		event.preventDefault();
	},
	keydownHandler: function(event) {

		const code = event.keyCode || event.which;

		if (code < 37 || code > 40) {
			return;
		}

		let changeX = 0;
		let changeY = 0;
		const dist = 20;

		switch (code) {
			case 40://down
				changeY = -dist;
				break;
			case 38://up
				changeY = dist;
				break;
			case 37://left
				changeX = dist;
				break;
			case 39://right
				changeX = -dist;
				break;
		}

		this.translationVelocityX = -changeX;//negative left
		this.translationVelocityY = changeY;//negative up

		this.translationAccelerationX += this.translationVelocityX * ACCELERATION_TO_VELOCITY;
		this.translationAccelerationY += this.translationVelocityY * ACCELERATION_TO_VELOCITY;

		this.needsRender = true;

		event.preventDefault();
	},
	updateMaxCameraZ: function() {
		const {camera} = this;

		const projectPointsFunc = convertPointForProjection(this.area.projection);

		this.max_camera_z = camera.far - 1;

		if (this.area) {
			const [ [x1, y1], [x2, y2] ] = this.area.bounds.map(projectPointsFunc);
			const size = Math.max(x2 - x1, y2 - y1);

			this.max_camera_z = Math.min((size / 4) / camera.aspect, this.max_camera_z);
		}
	},
	updateForCameraZ: function() {
		const self = this;
		const {camera, scene} = this;
		const {z: cameraZPosition} = camera.position;
		const cameraMatrixWorldInverse = camera.matrixWorldInverse;

		scene.children
		.filter(({userData}) => userData && userData.hide_at_z)
		.forEach(child => {
			const visible = cameraZPosition < child.userData.hide_at_z;

			if (!child.material) {
				child.visible = visible;

				return;
			}

			if (child.visible === visible || child.transitionOpacityDirection === visible) {
				return;
			}

			if (child.transitionOpacityRAF) {
				child.transitionOpacityRAF.stop();
			}

			const duration = 250;
			const endOpacity = visible ? 1 : 0;

			child.transitionOpacityDirection = visible;

			const previousBlending = child.material.blending;
			const previousTransparency = child.material.transparent;

			const position = child.material;
			const target = {opacity: endOpacity};
			const tween = new TWEEN.Tween(position).to(target, duration);

			child.transitionOpacityRAF = tween;

			function doneTransition() {
				child.material.blending = previousBlending;
				child.material.transparent = previousTransparency;
				child.material.opacity = endOpacity;
				child.visible = visible;

				child.material.needsUpdate = true;
				cancelAnimationFrame(child.transitionOpacityRAF);
				child.rAFOpacity = null;
				self.needsRender = true;
			}

			tween.onUpdate(() => self.needsRender = true);
			tween.onComplete(doneTransition);
			tween.onStop(doneTransition);

			tween.onStart(() => {
				child.visible = true;
				child.material.transparent = true;
				child.material.blending = THREE.NormalBlending;
			});

			tween.easing(TWEEN.Easing.Quartic.Out);
			tween.start();
		});

		scene.children
		.filter(child => child instanceof THREE.Sprite)
		.filter(child => child.visible)
		.forEach(sprite => {
			const virtual_z = -4 + (sprite.position.z / 1000);

			const v = sprite.position
			.clone()
			.applyMatrix4(cameraMatrixWorldInverse);

			const scale = ((v.z - cameraZPosition) / virtual_z);

			sprite.scale.set(scale, scale, scale);
		});

		this.needsRender = true;
	},
	animateIntoArea: function() {
		const self = this;
		const camera = this.camera;

		const duration = 1800;
		const endZ = camera.position.z;

		camera.position.z = this.max_camera_z;
		this.needsRender = true;

		const position = camera.position;

		const target = {
			z: endZ
		};

		const tween = new TWEEN.Tween(position).to(target, duration);

		function doneTransition() {
			camera.position.z = endZ;
			self.updateForCameraZ();
			self.needsRender = true;
		}

		tween.onStart(() => self.needsRender = true);
		tween.onUpdate(() => self.updateForCameraZ());
		tween.onComplete(doneTransition);
		tween.onStop(doneTransition);

		tween.easing(TWEEN.Easing.Quartic.InOut);
		tween.delay(200).start();
	},
	setUpArea: function(area) {
		const self = this;
		const {camera, scene} = this;

		console.time(area.name);

		this.updateMaxCameraZ();

		//mark progress of features loaded in. Start with 3 each, for each of: cycle line, walk line, checkin points – give the illusion of progress
		const otherFeatures = 3;
		const featuresToAdd = area.features.length + otherFeatures;
		let featuresAdded = otherFeatures;
		const updateProgress = () => self.progress = featuresAdded / featuresToAdd;

		const projectPointsFunc = convertPointForProjection(area.projection);

		let firstGeometry = null;

		updateProgress();

		function cameraToMeshGeometryCentroid(geometry) {

			const centroid = new THREE.Vector3();

			geometry.computeBoundingBox();
			centroid.addVectors(geometry.boundingBox.min, geometry.boundingBox.max);
			centroid.divideScalar(2);

			const size = geometry.boundingBox.getSize();
			const canvas = self.query("canvas");
			const screenAspectRatio = canvas.clientWidth / canvas.clientHeight;

			const dimension = Math.max(size.x, size.y) / 2;
			const cameraZPosition = Math.max(Math.min((dimension / screenAspectRatio), camera.far / 2), self.max_camera_z / 2);

			camera.position.set(centroid.x, centroid.y, cameraZPosition);
		}

		async.forEachOfSeries(area.features, (feature, index, callback) => {

			function addFeatureToScene() {
				featuresAdded++;
				updateProgress();

				if (!feature.projected_points.length) {
					feature.convertPointsForProjection(area.projection);
				}

				const mesh = feature.getMesh();

				scene.add(mesh);

				if (index === 0) {
					firstGeometry = mesh.geometry;
				}

				requestAnimationFrame(() => callback());
			}

			if (feature.geojson_uri && (feature.points && !feature.points.length)) {
				feature.once("change:points", addFeatureToScene);
				feature.fetchGeoJSON();
			} else {
				addFeatureToScene();
			}

		}, () => {
			cameraToMeshGeometryCentroid(firstGeometry);
			self.animateIntoArea();
		});

		/* Line */

		const filterActivities = filterActivitiesToBounds(area.bounds);

		const pointsToGeometry = points => {
			const lineGeometry = new Float32Array(points.length * 3);

			points.forEach((point, index) => {
				lineGeometry[index * 3 + 0] = point[0];
				lineGeometry[index * 3 + 1] = point[1];
				lineGeometry[index * 3 + 2] = 0;
			});

			const line = new MeshLine();

			line.setGeometry(lineGeometry);

			return line.geometry;
		};

		const lineZPosition = 1;

		this.data
		.filter(filterActivities)
		.map(walk => walk.points)
		.map(points => points.map(projectPointsFunc))
		.map(pointsToGeometry)
		.forEach((geometry) => {
			const mesh = new THREE.Mesh(geometry, rideLineMaterial);

			mesh.position.z = lineZPosition;
			mesh.matrixAutoUpdate = false;
			mesh.renderOrder = consts.RENDER_ORDER_LINES_RIDES;

			scene.add(mesh);
		});

		console.timeEnd(area.name);

		return area;
	}
});
