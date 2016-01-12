"use strict";

const View = require("ampersand-view");
const State = require("ampersand-state");
const proj4 = require("proj4");
const THREE = require("three.js");

const MeshLine = require("../THREE.MeshLine").MeshLine;
const MeshLineMaterial = require("../THREE.MeshLine").MeshLineMaterial;

const areas = require("../models/areas");

const checkins = require("../../../data/2015_foursquare-checkins.json");
const rides = require("../../../data/2015_rides_deduped_simplified.json");
const walks = require("../../../data/2015_walks_deduped_simplified.json");

const DECELERATION_RATE = 0.91;
const ACCELERATION_TO_VELOCITY = (1 - DECELERATION_RATE) * 2;
const ACCELERATION_MIN_CAP = 1 - DECELERATION_RATE;
const ACCELERATION_PROPERTIES = ["translationAccelerationX", "translationAccelerationY"];

const consts = require("../consts");

const CAMERA_NEAR = 500;

var curve = new THREE.CubicBezierCurve(
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(0.165, 0.84, 0),
	new THREE.Vector3(0.44, 1, 0),
	new THREE.Vector3(1, 1, 0)
);

function removeRecursive(parent) {
	parent.children
	.filter(child => !(child instanceof THREE.Scene))
	.forEach(child => {
		removeRecursive(child);
		parent.remove(child);
	});
}

function convertPointForProjection(toProjection) {
	return function(point) {
		return proj4(consts.PROJECTION_WGS84, toProjection, point);
	};
}

function filterActivitiesToBounds(bounds) {
	return activity => {
		
		let pointOrPoints = activity.points;
		
		if (!pointOrPoints) {
			pointOrPoints = [activity.point];
		}
		
		return pointOrPoints.every(
			point => point[0] > bounds[0][0] && point[0] < bounds[1][0] && point[1] > bounds[0][1] && point[1] < bounds[1][1]
		);
	};
}

const MapArea = State.extend({
	props: {
		name: {
			type: "string"
		},
		projection: {
			type: "string"
		},
		bounds: {
			type: "array",
			default: () => []
		},
		features: {
			type: "array",
			default: () => []
		}
	}
});

module.exports = View.extend({
	props: {
		area_name: {
			type: "string",
			default: "to"
		},
		area_title: {
			type: "string"
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
				<!--<a href="/maps/surrey">Surrey</a>-->
			</nav>
		</section>
	`,
	events: {
		"mousewheel canvas": "mousewheelHandler",
		"mousedown canvas": "mousedownHandler",
		"mousemove canvas": "mousemoveHandler",
		"mouseup canvas": "mouseupHandler",
		"touchstart canvas": "touchstartHandler",
		"touchmove canvas": "touchmoveHandler",
		"touchend canvas": "touchendHandler"
	},
	bindings: {
		"area_name": {
			type: "attribute",
			name: "data-area",
			selector: "section"
		},
		"area_title": {
			type: "attribute",
			name: "data-title",
			selector: "section"
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
	render: function() {
		this.renderWithTemplate(this);
		
		const canvas = this.canvas = this.query("canvas");
		
		const renderer = this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			canvas: canvas,
			alpha: true
		});
		
		renderer.setPixelRatio(window.devicePixelRatio || 1);
		
		const scene = this.scene = new THREE.Scene();
		const aspectRatio = canvas.clientWidth / canvas.clientHeight;
		this.camera = new THREE.PerspectiveCamera(90, aspectRatio, 0.1, 50000);
		
		requestAnimationFrame(() => this.windowResize());
		
		window.addEventListener("resize", () => requestAnimationFrame(() => this.windowResize()));
		
		const boundKeyDownHandler = event => {
			event.delegateTarget = canvas;
			this.keydownHandler.call(this, event);
		};
		
		document.addEventListener("keydown", boundKeyDownHandler);
		
		this.listenToAndRun(this, "change:area_name", () => {
			removeRecursive(scene);
			const area = this.area = new MapArea(areas[this.area_name]);
			this.area_title = area.name;
			requestAnimationFrame(() => this.setUpArea(area));
		});
		
		this.canvasRender();
		
		window.scene = scene;
		
		return this;
	},
	canvasRender: function () {
		
		requestAnimationFrame(() => this.canvasRender());
		
		if (!this.needsRender) {
			return;
		}
		
		const view = this;
		const camera = this.camera;
		
		let xTranslationUnits;
		let yTranslationUnits;
		
		if (!this.mouseDown /*&& !view.numFingersTouching*/)	{
			xTranslationUnits = this.translationAccelerationX;
			yTranslationUnits = this.translationAccelerationY;
		} else {
			xTranslationUnits = this.translationVelocityX;
			yTranslationUnits = this.translationVelocityY;
		}
		
		const distanceDampening = 100 * (0.75 / camera.position.z);
		
		xTranslationUnits /= distanceDampening;
		yTranslationUnits /= distanceDampening;
		xTranslationUnits /= 4;
		yTranslationUnits /= 4;
		
		camera.position.x += xTranslationUnits;
		camera.position.y += yTranslationUnits;
		
		view.translationVelocityX = 0;
		view.translationVelocityY = 0;
		
		ACCELERATION_PROPERTIES.forEach(prop => {

			//Slow the spinning down every frame
			view[prop] *= DECELERATION_RATE;

			//make sure we're not spinning forever
			if (Math.abs(view[prop]) < ACCELERATION_MIN_CAP) {
				view[prop] = 0;
			}
		});
		
		view.needsRender = ACCELERATION_PROPERTIES.some(prop => Boolean(view[prop]));
	
		this.renderer.render(this.scene, this.camera);
		//this.needsRender = false;
	},
	windowResize: function() {
		const renderer = this.renderer;
		const camera = this.camera;
		const rect = this.canvas.parentNode.getBoundingClientRect();
		
		renderer.setSize(rect.width, rect.height);
		
		camera.aspect = rect.width / rect.height;
		camera.updateProjectionMatrix();
		
		this.updateMaxCameraZ();
		this.updateForCameraZ();
		
		this.needsRender = true;
	},
	updateMaxCameraZ: function() {
		
		const camera = this.camera;
		
		const projectPointsFunc = convertPointForProjection(this.area.projection);
		
		this.max_camera_z = camera.far - 1;
		
		if (this.area) {
			const bounds = this.area.bounds.map(projectPointsFunc);
			const size = Math.max(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]);
			this.max_camera_z = Math.min((size / 4) / camera.aspect, this.max_camera_z);
		}
	},
	mousewheelHandler: function(event) {
		
		event.preventDefault();
		
		const camera = this.camera;
		
		camera.position.z += (event.deltaY * 0.0025) * (camera.position.z / 1.5);
		
		const minCameraZ = CAMERA_NEAR + 1;
		const maxCameraZ = Math.min(this.max_camera_z, this.camera.far - 1);
		
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

		this.translationAccelerationX += this.translationVelocityX * ACCELERATION_TO_VELOCITY;
		this.translationAccelerationY += this.translationVelocityY * ACCELERATION_TO_VELOCITY;
		
		this.needsRender = true;
	},
	mouseupHandler: function(event) {
		this.mouseDown = false;
		
		event.preventDefault();
	},
	touchstartHandler: function(event) {
		this.mouseDown = true;
		this.mouseDownX = event.touches[0].clientX;
		this.mouseDownY = event.touches[0].clientY;
		
		this.rotationAccelerationY = 0;
		this.rotationAccelerationX = 0;
		this.rotationVelocityX = 0;
		this.rotationVelocityY = 0;
		
		event.preventDefault();
	},
	touchmoveHandler: function(event) {
	
		if (!this.mouseDown) {
			return;
		}
		
		const changeX = event.touches[0].clientX - this.mouseDownX;
		const changeY = event.touches[0].clientY - this.mouseDownY;
		
		this.mouseDownX = event.touches[0].clientX;
		this.mouseDownY = event.touches[0].clientY;
		
		this.translationVelocityX = -changeX; //negative left
		this.translationVelocityY = changeY; //negative up

		this.translationAccelerationX += this.translationVelocityX * ACCELERATION_TO_VELOCITY;
		this.translationAccelerationY += this.translationVelocityY * ACCELERATION_TO_VELOCITY;
		
		this.needsRender = true;
		
		event.preventDefault();
	},
	touchendHandler: function(event) {
		this.mouseDown = false;
	
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
	updateForCameraZ: function() {
		
		const self = this;
		
		const camera = this.camera;
		const scene = this.scene;
		
		const cameraZPosition = camera.position.z;
		const cameraMatrixWorldInverse = camera.matrixWorldInverse;
		
		scene.children
		.filter(child => child.userData && child.userData.hide_at_z)
		.forEach(child => {
			const visible = cameraZPosition < child.userData.hide_at_z;
			
			if (!child.material) {
				child.visible = visible;
				return;
			}
			
			if (child.visible === visible || child.transitionOpacityDirection === visible) {
				return;
			}
			
			cancelAnimationFrame(child.transitionOpacityRAF);
			
			const startTime = Date.now();
			const duration = 200;
			const startOpacity = child.material.opacity;
			const endOpacity = visible ? 1 : 0;
			child.transitionOpacityDirection = visible;
			
			const previousBlending = child.material.blending;
			const previousTransparency = child.material.transparent;
			
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
			
			child.visible = true;
			child.material.transparent = true;
			child.material.blending = THREE.NormalBlending;
			
			requestAnimationFrame(function nextFrame() {
				const currentTime = Date.now();
				const alpha = (currentTime - startTime) / duration;
	
				if (alpha >= 1) {
					return doneTransition();
				}
	
				const adjustedAlpha = curve.getPoint(alpha).x;
	
				const currentOpacity = startOpacity + (adjustedAlpha * (endOpacity - startOpacity));
				child.material.opacity = currentOpacity;
	
				child.material.needsUpdate = true;
				self.needsRender = true;
				child.transitionOpacityRAF = requestAnimationFrame(nextFrame);
			});
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
	setUpArea: function(area) {
		
		const self = this;
		const camera = this.camera;
		const scene = this.scene;
		
		console.time(area.name);
		
		this.updateMaxCameraZ();
		
		const projectPointsFunc = convertPointForProjection(area.projection);
		
		area.features.forEach((feature, index) => {
			
			function addFeatureToScene() {
				requestAnimationFrame(() => {
					
					if (!feature.projected_points.length) {
						feature.convertPointsForProjection(area.projection);
					}
					
					const mesh = feature.getMesh();
					scene.add(mesh);
					
					if (index === 0) {
						cameraToMeshGeometryCentroid(mesh.geometry);
						requestAnimationFrame(() => self.updateForCameraZ());
					}
					
					self.needsRender = true;
				});
			}
			
			if (feature.geojson_uri && (feature.points && !feature.points.length)) {
				feature.once("change:points", addFeatureToScene);
				feature.fetchGeoJSON();
			} else {
				addFeatureToScene();
			}
		});
		
		function cameraToMeshGeometryCentroid(geometry) {
			
			const centroid = new THREE.Vector3();
			
			geometry.computeBoundingBox();
			centroid.addVectors(geometry.boundingBox.min, geometry.boundingBox.max);
			centroid.divideScalar(2);
			
			const size = geometry.boundingBox.size();
			const canvas = self.query("canvas");
			const screenAspectRatio = canvas.clientWidth / canvas.clientHeight;
			
			const dimension = Math.max(size.x, size.y) / 2;
			const cameraZPosition = Math.max(Math.min((dimension / screenAspectRatio), camera.far / 2), self.max_camera_z / 2);
			
			camera.position.set(centroid.x, centroid.y, cameraZPosition);
		}
		
		/* Line */
		
		const rideLineMaterial = new MeshLineMaterial({
			lineWidth: 10,//size of individual street
			sizeAttenuation: 1,
			depthTest: true,
			transparent: false,
			color: new THREE.Color(0xf35c20),
			//blending: THREE.AdditiveBlending
		});
		
		const walkLineMaterial = new MeshLineMaterial({
			lineWidth: 7.5,//half size of individual street
			sizeAttenuation: 1,
			depthTest: true,
			transparent: false,
			color: new THREE.Color(0x22d670),
			//blending: THREE.AdditiveBlending
		});
		
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
		
		rides
		.filter(filterActivities)
		.map(walk => walk.points)
		.map(points => points.map(projectPointsFunc))
		.map(pointsToGeometry)
		.forEach(function(geometry) {
			const mesh = new THREE.Mesh(geometry, rideLineMaterial);
			mesh.position.z = lineZPosition;
			mesh.matrixAutoUpdate = false;
			mesh.renderOrder = consts.RENDER_ORDER_LINES_RIDES;
			scene.add(mesh);
		});
		
		walks
		.filter(filterActivities)
		.map(walk => walk.points)
		.map(points => points.map(projectPointsFunc))
		.map(pointsToGeometry)
		.forEach(function(geometry) {
			const mesh = new THREE.Mesh(geometry, walkLineMaterial);
			mesh.position.z = lineZPosition * 2;
			mesh.matrixAutoUpdate = false;
			mesh.renderOrder = consts.RENDER_ORDER_LINES_WALKS;
			scene.add(mesh);
		});
		
		/* Points (checkins) */
		
		function makeCheckinDot(color) {
			const pointCanvas = document.createElement("canvas");
			const context = pointCanvas.getContext("2d");
			const pointDimension = 16 * window.devicePixelRatio;
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
			context.fillStyle = color || consts.COLOR_TEXT;
			context.fill();
			context.closePath();
			
			return pointCanvas;
		}

		const pointCanvas = makeCheckinDot();
		const pointTexture = new THREE.Texture(pointCanvas);
		pointTexture.premultiplyAlpha = true;
		pointTexture.needsUpdate = true;
		pointTexture.anisotropy = self.renderer.getMaxAnisotropy();
		pointTexture.magFilter = THREE.LinearFilter;
		pointTexture.minFilter = THREE.LinearFilter;
		
		const pointMaterial = new THREE.PointsMaterial({
			size: pointCanvas.width / 2,
			map: pointTexture,
			transparent: true,
			sizeAttenuation: false//true
		});
		
		pointMaterial.blending = THREE.CustomBlending;
		pointMaterial.blendSrc = THREE.OneFactor;
		
		pointMaterial.depthWrite = false;
		
		const checkinGeometry = new THREE.BufferGeometry();
		const checkinVertices = new Float32Array(checkins.length * 3);
		
		checkins
		.filter(filterActivities)
		.map(checkin => checkin.point)
		.map(point => projectPointsFunc(point))
		.forEach(function(point, index) {
			checkinVertices[index * 3 + 0] = point[0];
			checkinVertices[index * 3 + 1] = point[1];
			checkinVertices[index * 3 + 2] = 0;
		});
		
		checkinGeometry.addAttribute('position', new THREE.BufferAttribute(checkinVertices, 3));
		
		const checkinParticles = new THREE.Points(checkinGeometry, pointMaterial);
		checkinParticles.position.z = 0.0001;
		checkinParticles.renderOrder = consts.RENDER_ORDER_PLACES;
		checkinParticles.userData.hide_at_z = 6500;
		checkinParticles.visible = false;
		checkinParticles.material.transparent = true;
		checkinParticles.material.opacity = 0;
		
		scene.add(checkinParticles);
		this.updateForCameraZ();
		
		this.needsRender = true;
		
		console.timeEnd(area.name);
		
		return area;
	}
});
