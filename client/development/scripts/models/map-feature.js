import Model from "ampersand-model";
import * as THREE from "three";
import proj4 from "proj4";

import polyToShapeGeometry from "../utils/poly-to-shape-geometry";
import addPointsToPathOrShape from "../utils/add-points-to-path-or-shape";

import consts from "../consts";

function reduceGeometry(merged, current) {
	merged.merge(current);

	return merged;
}

const MapFeatures = Model.extend({
	url: function() {
		return `/data/${this.name}.json`;
	},
	props: {
		name: {
			type: "string"
		},
		points: {
			type: "array",
			default: () => []
		},
		projected_points: {
			type: "array",
			default: () => []
		},
		color: {
			type: "string",
			default: consts.COLOR_LAND
		},
		geojson_uri: {
			type: "string"
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
	convertPointsForProjection: function(projection) {

		function applyProjectionToPoint(point) {
			return proj4(consts.PROJECTION_WGS84, projection, point);
		}

		this.projected_points = this.points
		.map(feature => {
			feature.geometry.coordinates = feature.geometry.coordinates
			.map(poly => {

				if (feature.geometry.type === "MultiPolygon") {
					poly = poly.map(part => part.map(applyProjectionToPoint));
				} else {
					poly = poly.map(applyProjectionToPoint);
				}

				return poly;
			});

			return feature;
		});
	},
	polyToShapeGeometry: function() {

		return this.projected_points
		.map(feature => feature.geometry.coordinates
		.map(poly => {

			if (feature.geometry.type === "MultiPolygon") {
				return polyToShapeGeometry(poly);
			}

			const shape = new THREE.Shape();

			poly.forEach(addPointsToPathOrShape(shape));

			return new THREE.ShapeGeometry(shape);

		})
		.reduce(reduceGeometry))
		.reduce(reduceGeometry);
	},
	getMesh: function() {
		console.time(this.name);
		const geometry = this.polyToShapeGeometry();
		const plane = new THREE.Mesh(geometry, this.material);

		plane.name = this.name;
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

				if (err) {
					console.error(err);
				}

				self.points = body.features;
			}
		});
	}
});

export default MapFeatures;
