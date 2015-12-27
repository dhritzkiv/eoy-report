"use strict";

const THREE = require("three.js");
const MeshLine = require("./THREE.MeshLine").MeshLine;
const MeshLineMaterial = require("./THREE.MeshLine").MeshLineMaterial;

console.time("load");

const checkins = require("../../data/2015_foursquare-checkins.json")
const rides = require("../../data/2015_rides_dupes-marked_simplified.json");
const walks = require("../../data/2015_walks_deduped_simplified.json");
const lake_ontario_bounds = require("../../data/lake-ontario-simple_0-005-tolerance-multi.json");
const lake_simcoe_bounds = require("../../data/lake-simcoe-simple_0-005-tolerance.json");
const toronto_bounds = require("../../data/toronto-border5.json");

//bounds for Ontario
const xBounds = [-81, -78];
const yBounds = [42, 45];

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

function coordsToPoint(coords) {
	var latitude = coords[1];
	var longitude = coords[0];
	
	var mapWidth = 1;
	var mapHeight = 1;
	
	// get x value
	var x = (longitude + 180) * (mapWidth / 360)
	
	// convert from degrees to radians
	var latRad = latitude * Math.PI / 180;
	
	// get y value
	var mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
	var y = (mapHeight / 2) - (mapWidth * mercN / (2 * PI));
	
	return {
		x: x,
		y: y
	};
}

function addPointsToPathOrShape(pathOrShape) {
	return function(point, index) {
		if (index === 0) {
			pathOrShape.moveTo(point[0], point[1]);
		} else {
			pathOrShape.lineTo(point[0], point[1]);
		}
	}
}

function addPolygonsToShape(shape) {
	return function(polygon, index) {
		if (!index) {
			polygon.forEach(addPointsToPathOrShape(shape));
		} else {
			const path = new THREE.Path(polygon.map(function(point) {
				return new THREE.Vector2(point[0], point[1]);
			}));
			//polygon.forEach(addPointsToPathOrShape(path));
			shape.holes.push(path);
		}
	}
}

function polyToShapeGeometry(polygons) {
	const shape = new THREE.Shape();
	polygons.forEach(addPolygonsToShape(shape));
	return new THREE.ShapeGeometry(shape);
}

function reduceGeometry(merged, current) {	
	merged.merge(current);
	return merged;
}

function lonLatToVector3( lng, lat, out ) {
    out = out || new THREE.Vector3();

    //flips the Y axis
    lat = Math.PI / 2 - lat;

    //distribute to sphere
    out.set(
        Math.sin( lat ) * Math.sin( lng ),
        Math.cos( lat ),
        Math.sin( lat ) * Math.cos( lng )
    );

    return out;
}

//console.log(rides.map(ride => ride.points).map(point => lonLatToVector3(point[0], point[1])));

//console.log(lonLatToVector3(rides[0].points[0][0], rides[0].points[0][1]))

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.0001, 1);
const resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

let needsRender = true;

const renderer = new THREE.WebGLRenderer({
	antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(COLOR_LAND));

document.body.appendChild(renderer.domElement);

/* Lake Ontario */

const lakeMaterial = new THREE.MeshBasicMaterial({
	color: COLOR_WATER
});

lakeMaterial.depthWrite = false;

const lo_geometry = lake_ontario_bounds.features[0].geometry.coordinates
.map(polyToShapeGeometry)
.reduce(reduceGeometry);

const lo_material = lakeMaterial.clone();

/*const lo_texture = THREE.ImageUtils.loadTexture("/img/texture-test.png");
lo_texture.wrapS = THREE.RepeatWrapping;
lo_texture.wrapT = THREE.RepeatWrapping;
//lo_texture.magFilter = THREE.NearestFilter;
//lo_texture.minFilter = THREE.LinearFilter;//LinearMipMapNearestFilter;

lo_material.map = lo_texture;*/

const lo_plane = new THREE.Mesh(lo_geometry, lo_material);
lo_plane.renderOrder = RENDER_ORDER_FEATURES;
scene.add(lo_plane);

const ls_geometry = lake_simcoe_bounds.features[0].geometry.coordinates
.map(function(polygon) {
	const ls_shape = new THREE.Shape();
	polygon.forEach(addPointsToPathOrShape(ls_shape));
	return new THREE.ShapeGeometry(ls_shape);
})
.reduce(reduceGeometry);

const ls_plane = new THREE.Mesh(ls_geometry, lakeMaterial.clone());
ls_plane.renderOrder = RENDER_ORDER_FEATURES;
scene.add(ls_plane);

/* Toronto */

const to_geometry = toronto_bounds.features[0].geometry.coordinates
.map(polyToShapeGeometry)
.reduce(reduceGeometry);

var to_material = new THREE.MeshBasicMaterial({
	color: "#ebf2f1"
});

to_material.depthWrite = false

to_geometry.computeBoundingBox();
const to_plane = new THREE.Mesh(to_geometry, to_material);
to_plane.renderOrder = RENDER_ORDER_FEATURES;
scene.add(to_plane);

const to_centroid = new THREE.Vector3();
to_centroid.addVectors(to_geometry.boundingBox.min, to_geometry.boundingBox.max);
to_centroid.divideScalar(2);

const cameraZPosition = (to_geometry.boundingBox.size().x / 2) / (window.innerWidth / window.innerHeight);
camera.position.set(to_centroid.x, to_centroid.y, cameraZPosition * 1.1);

/* Toronto Parks */

const textureLoader = new THREE.TextureLoader();

textureLoader.load("/img/toronto-parks_alpha.png",	function (texture) {
	
	const to_park_geometry = new THREE.Geometry().copy(to_geometry);

	to_park_geometry.computeBoundingBox();
	
	const size = to_park_geometry.boundingBox.size();
	
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	
	texture.repeat.set(1 / size.x, 1 / size.y);
	texture.offset.set(0.5 - size.x + 0.0115, -size.y + 0.046);
	texture.magFilter = THREE.NearestFilter;
	
	var material = new THREE.MeshBasicMaterial({
		alphaMap: texture,
		color: COLOR_PARKS,
		transparent: true
	});
	
	material.depthWrite = false;
	
	material.blending = THREE.AdditiveAlphaBlending;
	
	const to_parks = new THREE.Mesh(to_park_geometry, material);
	to_parks.renderOrder = RENDER_ORDER_FEATURE_MAP;
	scene.add(to_parks);
	
	needsRender = true;
});

/* Label */

const labelSprites = [];

function makeTextLabelSprite(labelText, position, size) {
	labelText = labelText.toUpperCase();
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	const dimension = 512 * size;
	canvas.width = dimension;
	canvas.height = dimension;
	
	context.textAlign = "center";
	context.textBaseline = "middle";
	const fontSize = canvas.width / 8 * size;
	const fontWeight = size > 0.75 ? 700 : 400;
	context.font = fontWeight + " " + fontSize + "px 'Montserrat', sans-serif";
	
	context.strokeStyle = COLOR_LAND;
	context.lineWidth = (Math.floor(Math.sqrt(canvas.width)) * 0.25) * (size / 0.5);
	context.lineCap = "round";
	context.lineJoin = "round";
	context.strokeText(labelText, canvas.width / 2, canvas.height / 2);
	
	context.fillStyle = COLOR_TEXT;
	context.fillText(labelText, canvas.width / 2, canvas.height / 2);
	
	const textLabelMap = new THREE.Texture(canvas);
	
	//textLabelMap.anisotropy = renderer.getMaxAnisotropy();
	textLabelMap.magFilter = THREE.LinearFilter;
	textLabelMap.minFilter = THREE.LinearFilter;
	textLabelMap.needsUpdate = true;
	textLabelMap.premultiplyAlpha = true;
	
	const labelMaterial = new THREE.SpriteMaterial( {
		map: textLabelMap,
		transparent: true
	});
	
	labelMaterial.depthWrite = false;
	
	labelMaterial.blending = THREE.CustomBlending;
	labelMaterial.blendSrc = THREE.OneFactor;
	
	const sprite = new THREE.Sprite(labelMaterial);
	sprite.renderOrder = RENDER_ORDER_TEXT;
	sprite.position.set(position[0], position[1], 0.05 * size);
	scene.add(sprite);
	
	labelSprites.push(sprite);
	return sprite;
}

makeTextLabelSprite("Toronto", [camera.position.x, camera.position.y], LABEL_SIZE_METRO);
makeTextLabelSprite("Mississauga", [-79.65, 43.6], LABEL_SIZE_SMALL);
makeTextLabelSprite("Guelph", [-80.248167, 43.544805], LABEL_SIZE_SMALL);
makeTextLabelSprite("Hamilton", [-79.866091, 43.250021], LABEL_SIZE_SMALL);
makeTextLabelSprite("Oakville", [-79.687666, 43.467517], LABEL_SIZE_SMALL);
makeTextLabelSprite("Barrie", [-79.690332, 44.389356], LABEL_SIZE_SMALL);
makeTextLabelSprite("Oro-Medonte", [-79.523333, 44.5], LABEL_SIZE_SMALL);

function updateSpriteScale(sprite) {
	const virtual_z = -4 + (sprite.position.z / 4);
	
	const v = sprite.position
	.clone()
	.applyMatrix4(camera.matrixWorldInverse);
	
	const scale = (v.z - camera.position.z) / virtual_z;
	sprite.scale.set(scale, scale, scale);
}

/* Points (checkins) */

const pointCanvas = document.createElement("canvas");
const pointCanvasContext = pointCanvas.getContext("2d");
const pointDimension = 96;
const pointRadius = pointDimension / 2;
const pointLineWidth = pointDimension / 8;
pointCanvas.width = pointDimension;
pointCanvas.height = pointDimension;
pointCanvasContext.fillStyle = COLOR_TEXT;
pointCanvasContext.strokeStyle = COLOR_LAND;
pointCanvasContext.lineWidth = pointLineWidth;
pointCanvasContext.beginPath();
pointCanvasContext.arc(pointRadius, pointRadius, pointRadius - pointLineWidth, 0, 2 * Math.PI);
pointCanvasContext.fill();
pointCanvasContext.closePath();
pointCanvasContext.beginPath();
pointCanvasContext.arc(pointRadius, pointRadius, pointRadius - (pointLineWidth / 2), 0, 2 * Math.PI);
pointCanvasContext.stroke();
pointCanvasContext.closePath();

const pointTexture = new THREE.Texture(pointCanvas);
pointTexture.premultiplyAlpha = true;
pointTexture.needsUpdate = true;

const pointMaterial = new THREE.PointsMaterial({
	size: 0.001,
	map: pointTexture,
	transparent: true,
	sizeAttenuation: true
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
checkinParticles.renderOrder = RENDER_ORDER_PLACES;

scene.add(checkinParticles);

/* Line */

const rideLineMaterial = new MeshLineMaterial({
	lineWidth: 0.0001 * 2.5,//size of individual street
	sizeAttenuation: 1,
	resolution: resolution,
	near: camera.near,
	far: camera.far,
	depthTest: true,
	transparent: false,
	color: new THREE.Color(0xf35c20),
	blending: THREE.AdditiveBlending
});

//rideLineMaterial.depthWrite = false;

const walkLineMaterial = new MeshLineMaterial({
	lineWidth: 0.0001 * 1.25,//size of individual street
	sizeAttenuation: 1,
	resolution: resolution,
	near: camera.near,
	far: camera.far,
	depthTest: true,
	transparent: false,
	color: new THREE.Color(0xbc4fff),
	blending: THREE.AdditiveBlending
});

//walkLineMaterial.depthWrite = false;

function filterActivitiesToBounds(activity) {
	return activity.points.every(function(point) {
		return point[0] > xBounds[0] &&
			point[0] < xBounds[1] &&
			point[1] > yBounds[0] &&
			point[1] < yBounds[1];
	});
}

rides
.filter(filterActivitiesToBounds)
.filter(ride => !ride.dupe)
.map(function(ride) {
	
	const lineGeometry = new Float32Array(ride.points.length * 3);

	ride.points.forEach((point, index) => {	
		lineGeometry[index * 3 + 0] = point[0];
		lineGeometry[index * 3 + 1] = point[1];
		lineGeometry[index * 3 + 2] = 0;
	});
	
	const line = new MeshLine();
	line.setGeometry(lineGeometry);
	
	return line;
})
.map(line => line.geometry)
.forEach(function(geometry) {
	const mesh = new THREE.Mesh(geometry, rideLineMaterial);
	mesh.position.z = 0.0001;
	mesh.renderOrder = RENDER_ORDER_LINES_RIDES;
	scene.add(mesh);
});

walks
.filter(filterActivitiesToBounds)
.filter(walk => !walk.dupe)
.forEach(function(walk) {
	const lineGeometry = new Float32Array(walk.points.length * 3);

	walk.points.forEach((point, index) => {	
		lineGeometry[index * 3 + 0] = point[0];
		lineGeometry[index * 3 + 1] = point[1];
		lineGeometry[index * 3 + 2] = 0;
	});
	
	const line = new MeshLine();
	line.setGeometry(lineGeometry);
	
	const mesh = new THREE.Mesh( line.geometry, walkLineMaterial );
	mesh.position.z = 0.0001;
	//mesh.matrixAutoUpdate = false;
	mesh.renderOrder = RENDER_ORDER_LINES_WALKS;
	
	scene.add(mesh);
});

const render = function () {
	requestAnimationFrame(render);
	
	if (!needsRender) {
		return;
	}

	renderer.render(scene, camera);
	needsRender = false;
};

onWindowResize();

render();

labelSprites.forEach(updateSpriteScale);
needsRender = true;

console.timeEnd("load");

function onWindowResize() {

	var w = window.innerWidth;
	var h = window.innerHeight;

	renderer.setSize( w, h );
	resolution.set( w, h );

	camera.aspect = w / h;
	camera.updateProjectionMatrix();
	
	needsRender = true;
}

window.addEventListener("resize", onWindowResize);

renderer.domElement.addEventListener("mousewheel", function(event) {
	event.preventDefault();
	camera.position.z += (event.deltaY * 0.0025) * (camera.position.z / 1.5);
	
	const minCameraZ = 0.02;
	
	if (camera.position.z < minCameraZ) {
		camera.position.z = minCameraZ;
	} else if (camera.position.z > camera.far) {
		camera.position.z = camera.far;
	}
	
	labelSprites.forEach(updateSpriteScale);
	
	needsRender = true;
});

let mouseDown = false;
let mouseDownX = 0;
let mouseDownY = 0;

renderer.domElement.addEventListener("mousedown", function(event) {
	mouseDown = true;
	mouseDownX = event.clientX;
	mouseDownY = event.clientY;
	
	event.preventDefault();
});

renderer.domElement.addEventListener("mousemove", function(event) {
	
	if (!mouseDown) {
		return;
	}
	
	var changeX = event.clientX - mouseDownX;
	var changeY = event.clientY - mouseDownY;
	
	mouseDownX = event.clientX;
	mouseDownY = event.clientY;
	
	camera.position.x -= changeX * (0.0033 / (1 / camera.position.z));
	camera.position.y += changeY * (0.0033 / (1 / camera.position.z));
	
	needsRender = true;
	
	event.preventDefault();
});

renderer.domElement.addEventListener("mouseup", function(event) {
	mouseDown = false;
	event.preventDefault();
});

renderer.domElement.addEventListener("touchstart", function(event) {
	mouseDown = true;
	mouseDownX = event.touches[0].clientX;
	mouseDownY = event.touches[0].clientY;
	event.preventDefault();
});

renderer.domElement.addEventListener("touchmove", function(event) {
	
	if (!mouseDown) {
		return;
	}
	
	var changeX = event.touches[0].clientX - mouseDownX;
	var changeY = event.touches[0].clientY - mouseDownY;
	
	mouseDownX = event.touches[0].clientX;
	mouseDownY = event.touches[0].clientY;
	
	camera.position.x -= changeX * (0.0033 / (1 / camera.position.z));
	camera.position.y += changeY * (0.0033 / (1 / camera.position.z));
	
	needsRender = true;
	
	event.preventDefault();
});

renderer.domElement.addEventListener("touchend", function(event) {
	mouseDown = false;
	
	event.preventDefault();
});