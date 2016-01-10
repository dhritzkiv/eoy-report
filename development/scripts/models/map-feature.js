"use strict";

const consts = require("../consts");
const Model = require("ampersand-model");
const THREE = require("three.js");

const polyToShapeGeometry = require("../utils/poly-to-shape-geometry");
const addPointsToPathOrShape = require("../utils/add-points-to-path-or-shape");

function reduceGeometry(merged, current) {	
	merged.merge(current);
	return merged;
}

module.exports = Model.extend({
	url: function() {
		return `/data/${this.name}.json`;
	},
	props: {
		name: {
			type: "string"
		},
		points: {
			type: "array"
		},
		color: {
			type: "string",
			default: consts.COLOR_LAND
		},
		geojson_uri: {
			type: "string"
		},
		geometry_type: {
			type: "string",
			default: "MultiPolygon"
		},
		z_position: {
			type: "number",
			default: 0
		},
		renderOrder: {
			type: "number",
			default: consts.RENDER_ORDER_FEATURES
		},
		hide_at_z: {
			type: "number"
		},
		visible: {
			type: "boolean",
			default: true
		}
	},
	derived: {
		material: {
			deps: ["color"],
			fn: function() {
				const material = new THREE.MeshBasicMaterial({
					color: this.color
				});
				
				material.depthWrite = false;
				
				return material;
			}
		}
	},
	polyToShapeGeometry: function() {
		return this.points
		.map(feature => {
			return feature.geometry.coordinates
			.map(poly => {
				
				if (feature.geometry.type === "MultiPolygon") {
					return polyToShapeGeometry(poly);
				}
				
				const shape = new THREE.Shape();
				poly.forEach(addPointsToPathOrShape(shape));
				return new THREE.ShapeGeometry(shape);
				
			})
			.reduce(reduceGeometry);
		})
		.reduce(reduceGeometry);
	},
	getMesh: function() {
		console.time(this.name);
		const geometry = this.polyToShapeGeometry();
		const plane = new THREE.Mesh(geometry, this.material);
		plane.renderOrder = this.renderOrder;
		plane.position.z = this.z_position;
		plane.matrixAutoUpdate = false;
		plane.userData = this.hide_at_z;
		plane.visible = this.visible;
		console.timeEnd(this.name);
		return plane;
	},
	fetchGeoJSON: function() {
		const self = this;
		
		this.fetch({
			uri: this.geojson_uri,
			always: function(err, res, body) {
				self.points = body.features;
			}
		});
	}
});