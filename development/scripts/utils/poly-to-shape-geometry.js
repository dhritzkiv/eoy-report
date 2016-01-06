"use strict";

const THREE = require("three.js");
const addPolygonsToShape = require("./add-polygons-to-shape");

module.exports = function polyToShapeGeometry(polygons) {
	const shape = new THREE.Shape();
	polygons.forEach(addPolygonsToShape(shape));
	return new THREE.ShapeGeometry(shape);
}