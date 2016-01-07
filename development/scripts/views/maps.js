"use strict";

const View = require("ampersand-view");
const State = require("ampersand-state");
const Model = require("ampersand-model");
const Collection = require("ampersand-collection");

const THREE = require("three.js");
const MeshLine = require("../THREE.MeshLine").MeshLine;
const MeshLineMaterial = require("../THREE.MeshLine").MeshLineMaterial;

const checkins = require("../../../data/2015_foursquare-checkins.json");
const rides = require("../../../data/2015_rides_deduped_simplified.json");
const walks = require("../../../data/2015_walks_deduped_simplified.json");

const consts = require("../consts");

function filterActivitiesToBounds(bounds) {
	return activity => activity.points.every(
		point => point[0] > bounds[0][0] && point[0] < bounds[1][0] && point[1] > bounds[0][1] && point[1] < bounds[1][1]
	)
}

const resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

/*const FeaturesCollection = Collection.extend({
	
});*/

const MapFeature = require("../models/map-feature");
const LakeMapFeature = require("../models/map-feature_lake");
const RoadMapFeature = require("../models/map-feature_road");
const LabelMapFeature = require("../models/map-feature_label");

const MapArea = State.extend({
	props: {
		name: {
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
	},
});

const CityState = State.extend({
	props: {
		name: {
			type: "string"
		},
		bounds: {
			type: "array",
			default: () => []
		}
	},
	collections: {
		
	}
});

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
	areas: {
		to: {
			name: "Toronto",
			bounds: [	
				[-81, 42],
				[-78, 45]
			],
			features: [
				new MapFeature({
					geojson_uri: "/data/toronto-border.geojson"
				}),
				new LakeMapFeature({
					name: "Lake Ontario",
					geojson_uri: "/data/lake-ontario-coastline.geojson"
				}),
				new LakeMapFeature({
					name: "Lake Simcoe",
					geojson_uri: "/data/lake-simcoe-coastline.geojson"
				}),
				new MapFeature({
					name: "Billy Bishop Grounds",
					geojson_uri: "/data/ytz-airport-grounds.geojson",
					color: consts.COLOR_AIRPORT_GROUNDS,
					renderOrder: 0.005
				}),
				new MapFeature({
					name: "Billy Bishop Features",
					geojson_uri: "/data/ytz-airport-features.geojson",
					color: consts.COLOR_AIRPORT_FEATURES,
					renderOrder: 0.01
				}),
				new MapFeature({
					name: "Pearson Grounds",
					geojson_uri: "/data/yyz-airport-grounds.geojson",
					color: consts.COLOR_AIRPORT_GROUNDS,
					renderOrder: 0.005
				}),
				new MapFeature({
					name: "Pearson Features",
					geojson_uri: "/data/yyz-airport-features.geojson",
					color: consts.COLOR_AIRPORT_FEATURES,
					renderOrder: 0.01
				}),
				new MapFeature({
					name: "Toronto Parks",
					geojson_uri: "/data/toronto-parks.geojson",
					color: consts.COLOR_PARKS,
					renderOrder: 0.02
				}),
				new LabelMapFeature({
					name: "Toronto",
					position: new THREE.Vector3(-79.4, 43.7, 0.025),
					size: consts.LABEL_SIZE_METRO
				}),
				new LabelMapFeature({
					name: "Hamilton",
					position: new THREE.Vector3(-79.866091, 43.250021, 0.01),
					size: consts.LABEL_SIZE_MEDIUM
				}),
				new LabelMapFeature({
					name: "Guelph",
					position: new THREE.Vector3(-80.248167, 43.544805, 0.01),
					size: consts.LABEL_SIZE_MEDIUM
				}),
				new LabelMapFeature({
					name: "Oakville",
					position: new THREE.Vector3(-79.687666, 43.467517, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Barrie",
					position: new THREE.Vector3(-79.690332, 44.389356, 0.01),
					size: consts.LABEL_SIZE_MEDIUM
				}),
				new LabelMapFeature({
					name: "Missisauga",
					position: new THREE.Vector3(-79.65, 43.6, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Oro-Medonte",
					position: new THREE.Vector3(-79.523333, 44.5, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Burlington",
					position: new THREE.Vector3(-79.8, 43.316667, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Vaughn",
					position: new THREE.Vector3(-79.5, 43.83333, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "King",
					position: new THREE.Vector3(-79.6044, 44.0463, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Bradford",
					position: new THREE.Vector3(-79.633333, 44.13333, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Innisfil",
					position: new THREE.Vector3(-79.583333, 44.3, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Pickering",
					position: new THREE.Vector3(-79.089, 43.8354, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Newmarket",
					position: new THREE.Vector3(-79.466667, 44.05, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				/*new LabelMapFeature({
					name: "Aurora",
					position: new THREE.Vector3(-79.466667, 44, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),*/
				new LabelMapFeature({
					name: "Broke Wrist Here",
					position: new THREE.Vector3(-79.545822, 44.112856, 0.005),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.1
				}),
				new LabelMapFeature({
					name: "WayHome",
					position: new THREE.Vector3(-79.520159, 44.479942, 0.005),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.15
				}),
				new LabelMapFeature({
					name: "YTZ",
					position: new THREE.Vector3(-79.396111, 43.6275, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.075
				}),
				new LabelMapFeature({
					name: "YYZ",
					position: new THREE.Vector3(-79.630556, 43.676667, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.075
				})
			]
		},
		lv: {
			name: "Las Vegas",
			bounds: [	
				[-115.25, 35.5],
				[-114.75, 36.5]
			],
			features: [
				new MapFeature({
					geojson_uri: "/data/lv-box.geojson",
					renderOrder: -0.1
				}),
				new MapFeature({
					geojson_uri: "/data/lv-commercial.geojson",
					color: "#eeddba"
				}),
				new MapFeature({
					geojson_uri: "/data/lv-parks.geojson",
					color: consts.COLOR_PARKS,
					renderOrder: -0.01
				}),
				new MapFeature({
					geojson_uri: "/data/lv-airport-features.geojson",
					color: consts.COLOR_AIRPORT_FEATURES,
					renderOrder: 0.01
				}),
				new MapFeature({
					geojson_uri: "/data/lv-airport-grounds.geojson",
					color: consts.COLOR_AIRPORT_GROUNDS,
					renderOrder: 0
				}),
				new RoadMapFeature({
					name: "Roads",
					geojson_uri: "/data/lv-roads.geojson"
				}),
				new LabelMapFeature({
					name: "Las Vegas",
					position: new THREE.Vector3(-115.136389, 36.175, 0.01),
					size: consts.LABEL_SIZE_METRO
				}),
				new LabelMapFeature({
					name: "Las Vegas Strip",
					position: new THREE.Vector3(-115.172222, 36.120833, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "Las Vegas Strip",
					position: new THREE.Vector3(-115.172222, 36.120833, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "LAS",
					position: new THREE.Vector3(-115.152222, 36.08, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.075
				})
			]
		},
		nyc: {
			name: "New York City",
			bounds: [	
				[-74.25, 40.5],
				[-73.25, 41]
			],
			features: [
				new MapFeature({
					geojson_uri: "/data/new-york-city-admin.geojson",
					renderOrder: -0.02
				}),
				new LakeMapFeature({
					geojson_uri: "/data/new-york-coastline.geojson"
				}),
				new MapFeature({
					geojson_uri: "/data/newark-airport-grounds.geojson",
					color: consts.COLOR_AIRPORT_GROUNDS,
				}),
				new MapFeature({
					geojson_uri: "/data/newark-airport-features.geojson",
					color: consts.COLOR_AIRPORT_FEATURES,
					renderOrder: 0.01
				}),
				new MapFeature({
					geojson_uri: "/data/new-york-parks.geojson",
					color: consts.COLOR_PARKS,
					renderOrder: 0.015
				}),,
				new RoadMapFeature({
					name: "MTA",
					geojson_uri: "/data/new-york-subway.geojson",
					renderOrder: 0.02
				}),
				new LabelMapFeature({
					name: "Manhattan",
					position: new THREE.Vector3(-73.959722, 40.790278, 0.01),
					size: consts.LABEL_SIZE_METRO
				}),
				new LabelMapFeature({
					name: "Brooklyn",
					position: new THREE.Vector3(-73.990278, 40.692778, 0.01),
					size: consts.LABEL_SIZE_METRO
				}),
				new LabelMapFeature({
					name: "Newark",
					position: new THREE.Vector3(-74.172367, 40.735657, 0.01),
					size: consts.LABEL_SIZE_SMALL
				}),
				new LabelMapFeature({
					name: "EWR",
					position: new THREE.Vector3(-74.168611, 40.6925, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.075
				}),
				/*new LabelMapFeature({
					name: "WTC",
					position: new THREE.Vector3(-74.0125, 40.711667, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.05
				}),
				new LabelMapFeature({
					name: "High Line",
					position: new THREE.Vector3(-74.005, 40.748333, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.05
				}),
				new LabelMapFeature({
					name: "UN Building",
					position: new THREE.Vector3(-73.968056, 40.749444, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.05
				}),
				new LabelMapFeature({
					name: "Flatiron Building",
					position: new THREE.Vector3(-73.989722, 40.741111, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.05
				}),
				new LabelMapFeature({
					name: "Williamsburg",
					position: new THREE.Vector3(-73.95333, 40.713333, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.05
				}),
				new LabelMapFeature({
					name: "Chinatown",
					position: new THREE.Vector3(-73.997222, 40.714722, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.05
				}),
				new LabelMapFeature({
					name: "SoHo",
					position: new THREE.Vector3(-74.000833, 40.723056, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.05
				})*/
			]
		},
		pdx: {
			name: "Portland",
			bounds: [	
				[-123, 45],
				[-122, 46]
			],
			features: [
				new MapFeature({
					geojson_uri: "/data/portland-boundaries.geojson",
					renderOrder: -0.02
				}),
				new LakeMapFeature({
					geojson_uri: "/data/portland-river-coasts.geojson"
				}),
				new MapFeature({
					geojson_uri: "/data/portland-airport-grounds.geojson",
					color: consts.COLOR_AIRPORT_GROUNDS,
				}),
				new MapFeature({
					geojson_uri: "/data/portland-airport-features.geojson",
					color: consts.COLOR_AIRPORT_FEATURES,
					renderOrder: 0.01
				}),
				new MapFeature({
					geojson_uri: "/data/portland-parks.geojson",
					color: consts.COLOR_PARKS,
					renderOrder: 0.01
				}),
				new RoadMapFeature({
					name: "Trimet",
					geojson_uri: "/data/portland-bus-routes-merged-joined_fixed.geojson",
					renderOrder: 0.02,
					hide_at_z: 0.075
				}),
				new LabelMapFeature({
					name: "Portland",
					position: new THREE.Vector3(-122.681944, 45.52, 0.01),
					size: consts.LABEL_SIZE_METRO,
				}),
				new LabelMapFeature({
					name: "PDX",
					position: new THREE.Vector3(-122.5975, 45.588611, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.075
				}),
				new LabelMapFeature({
					name: "XOXO",
					position: new THREE.Vector3(-122.652, 45.518972, 0.001),
					size: consts.LABEL_SIZE_NANO,
					hide_at_z: 0.075
				})
			]
		},
		/*surrey: {
			name: "Surrey",
			bounds: [
				[-122.95, 48.75],
				[-122.25, 49.25]
			],
			features: [
				new MapFeature({
					geojson_uri: "/data/surrey-box.geojson",
					renderOrder: -0.02
				}),
				new LakeMapFeature({
					geojson_uri: "/data/surrey-coastline.geojson"
				}),
				new MapFeature({
					geojson_uri: "/data/surrey-parks.geojson",
					color: consts.COLOR_PARKS
				}),
				new RoadMapFeature({
					name: "Roads",
					geojson_uri: "/data/surrey-roads.geojson"
				})
			]
		}*/
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
	isMouseDown: false,
	mouseDownX: 0,
	mouseDownY: 0,
	render: function() {
		this.renderWithTemplate(this);
		
		const canvas = this.canvas = this.query("canvas");
		
		const renderer = this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			canvas: canvas
		});
		
		renderer.setClearColor(consts.COLOR_LAND);
		renderer.setPixelRatio(window.devicePixelRatio || 1);
		
		const scene = this.scene = new THREE.Scene();
		const camera = this.camera = new THREE.PerspectiveCamera(90, canvas.clientWidth / canvas.clientHeight, 0.0001, 1);
		
		requestAnimationFrame(() => this.windowResize());
		
		window.addEventListener("resize", () => requestAnimationFrame(() => this.windowResize()));
		
		const boundKeyDownHandler = event => {
			event.delegateTarget = canvas;
			this.keydownHandler.call(this, event);
		};
		
		document.addEventListener("keydown", boundKeyDownHandler);
		
		this.canvasRender();
		
		function removeRecursive(parent) {
			parent.children
			.filter(child => child instanceof THREE.Object3D)
			.forEach(child => {
				removeRecursive(child);
				parent.remove(child);
			});
		}
		
		this.listenToAndRun(this, "change:city", () => {
			
			removeRecursive(scene);
			
			const area = this.area = new MapArea(this.areas[this.city]);
			
			requestAnimationFrame(() => this.setUpArea(area));
		});
		
		window.scene = scene;
		
		return this;
	},
	canvasRender: function () {
		requestAnimationFrame(() => this.canvasRender());
		
		if (!this.needsRender) {
			return;
		}
	
		this.renderer.render(this.scene, this.camera);
		this.needsRender = false;
	},
	windowResize: function() {
		const renderer = this.renderer;
		const camera = this.camera;
		const rect = this.canvas.parentNode.getBoundingClientRect();
		
		renderer.setSize(rect.width, rect.height);
		resolution.set(rect.width, rect.height);
		
		camera.aspect = rect.width / rect.height;
		camera.updateProjectionMatrix();
		
		this.updateMaxCameraZ();
		this.updateForCameraZ();
		
		this.needsRender = true;
	},
	updateMaxCameraZ: function() {
		
		const camera = this.camera;
		
		if (this.area) {
			const bounds = this.area.bounds;
			const size = Math.max(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1])
			this.max_camera_z = (size / 4) / camera.aspect;
		} else {
			this.max_camera_z = camera.far;
		}
	},
	mousewheelHandler: function(event) {
		
		event.preventDefault();
		
		const camera = this.camera;
		
		camera.position.z += (event.deltaY * 0.0025) * (camera.position.z / 1.5);
		
		const minCameraZ = 0.02;
		const maxCameraZ = this.max_camera_z;
		
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
		
		const camera = this.camera;
		
		camera.position.x -= changeX * (0.0033 / (1 / camera.position.z));
		camera.position.y += changeY * (0.0033 / (1 / camera.position.z));
		
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
		
		event.preventDefault();
	},
	touchmoveHandler: function(event) {
	
		if (!this.mouseDown) {
			return;
		}
		
		var changeX = event.touches[0].clientX - this.mouseDownX;
		var changeY = event.touches[0].clientY - this.mouseDownY;
		
		this.mouseDownX = event.touches[0].clientX;
		this.mouseDownY = event.touches[0].clientY;
		
		const camera = this.camera;
		
		camera.position.x -= changeX * (0.0033 / (1 / camera.position.z));
		camera.position.y += changeY * (0.0033 / (1 / camera.position.z));
		
		this.needsRender = true;
		
		event.preventDefault();
	},
	touchendHandler: function(event) {
		this.mouseDown = false;
	
		event.preventDefault();
	},
	keydownHandler: function(event) {
		
		const camera = this.camera;
		const code = event.keyCode || event.which;
		
		if (code < 37 || code > 40) {
			return;
		}
		
		let changeX = 0;
		let changeY = 0;
		
		switch (code) {
			case 40://down
				changeY = -10;
				break;
			case 38://up
				changeY = 10;
				break;
			case 37://left
				changeX = 10;
				break;
			case 39://right
				changeX = -10;
				break;
		}
		
		camera.position.x -= changeX * (0.0033 / (1 / camera.position.z));
		camera.position.y += changeY * (0.0033 / (1 / camera.position.z));
		
		this.needsRender = true;
		
		event.preventDefault();
	},
	updateForCameraZ: function() {
		
		const camera = this.camera;
		const scene = this.scene;
		
		const cameraZPosition = camera.position.z;
		const cameraMatrixWorldInverse = camera.matrixWorldInverse;
		
		scene.children
		.filter(child => child.userData && child.userData.hide_at_z)
		.forEach(child => {
			child.visible = cameraZPosition < child.userData.hide_at_z;
		});
		
		scene.children
		.filter(child => child instanceof THREE.Sprite)
		.filter(child => child.visible)
		.forEach(sprite => {
			const virtual_z = -4 + (sprite.position.z / 4);
	
			const v = sprite.position
			.clone()
			.applyMatrix4(cameraMatrixWorldInverse);
			
			const scale = (v.z - cameraZPosition) / virtual_z;
			sprite.scale.set(scale, scale, scale);
		});
		
		this.needsRender = true;
	},
	setUpArea: function(area) {
		
		const self = this;
		const camera = this.camera;
		const scene = this.scene;
		
		//scene.traverse(object => scene.remove(object));
		
		console.time(area.name);
		
		this.updateMaxCameraZ();
		
		area.features.forEach(feature => feature.points = []);
		
		area.features.forEach((feature, index) => {
			
			if (feature.geojson_uri) {
				feature.once("change:points", function() {
					requestAnimationFrame(function() {
						
						const mesh = feature.getMesh();
						
						if (index === 0) {
							cameraToMeshGeometryCentroid(mesh.geometry);
							requestAnimationFrame(() => self.updateForCameraZ());
						}
						
						scene.add(mesh);
						self.needsRender = true;
					});
				});
				
				feature.fetchGeoJSON();
			} else {
				const mesh = feature.getMesh();
				scene.add(mesh);
				self.needsRender = true;
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
			const areaAspectRatio = size.x / size.y;
			let dimension = 0;
			
			if (screenAspectRatio < areaAspectRatio) {
				dimension = size.x / 2;
			} else {
				dimension = size.y / 2;
			}
			
			const cameraZPosition = dimension / screenAspectRatio;
			
			camera.position.set(centroid.x, centroid.y, cameraZPosition * 1.2);
		}
		
		/* Line */
		
		const rideLineMaterial = new MeshLineMaterial({
			lineWidth: 0.0001 * 2.5,//size of individual street
			sizeAttenuation: 1,
			depthTest: true,
			transparent: false,
			color: new THREE.Color(0xf35c20),
			blending: THREE.AdditiveBlending
		});
		
		const walkLineMaterial = new MeshLineMaterial({
			lineWidth: 0.0001 * 1.25,//half size of individual street
			sizeAttenuation: 1,
			depthTest: true,
			transparent: false,
			color: new THREE.Color(0x22d670),
			blending: THREE.AdditiveBlending
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
		
		const lineZPosition = 0.0000015;
		
		rides
		.filter(filterActivities)
		//.filter(ride => !ride.dupe)
		.map(walk => walk.points)
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
		//.filter(walk => !walk.dupe)
		.map(walk => walk.points)
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
			const pointDimension = 12;
			const pointRadius = pointDimension / 2;
			const pointLineWidth = pointDimension / 6;
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
			
			return pointCanvas
		}

		const pointTexture = new THREE.Texture(makeCheckinDot());
		pointTexture.premultiplyAlpha = true;
		pointTexture.needsUpdate = true;
		pointTexture.magFilter = THREE.NearestFilter;
		pointTexture.minFilter = THREE.NearestFilter;//THREE.LinearFilter;//LinearMipMapNearestFilter;
		
		const pointMaterial = new THREE.PointsMaterial({
			size: 12,//0.00075,
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
		.map(checkin => checkin.point)
		.forEach(function(point, index) {
			checkinVertices[index * 3 + 0] = point[0];
			checkinVertices[index * 3 + 1] = point[1];
			checkinVertices[index * 3 + 2] = 0;
		});
		
		checkinGeometry.addAttribute('position', new THREE.BufferAttribute(checkinVertices, 3));
		
		const checkinParticles = new THREE.Points(checkinGeometry, pointMaterial);
		checkinParticles.position.z = 0.0001;
		checkinParticles.renderOrder = consts.RENDER_ORDER_PLACES;
		checkinParticles.userData.hide_at_z = 0.075;
		
		scene.add(checkinParticles);
		
		this.needsRender = true;
		
		this.updateForCameraZ();
		
		console.timeEnd(area.name);
		
		return area;
	}
});