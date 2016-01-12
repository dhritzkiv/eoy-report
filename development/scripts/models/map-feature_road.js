"use strict";

const THREE = require("three.js");
const MapFeature = require("./map-feature");
const consts = require("../consts");

const MeshLine = require("../THREE.MeshLine").MeshLine;
const MeshLineMaterial = require("../THREE.MeshLine").MeshLineMaterial;

module.exports = MapFeature.extend({
	props: {
		renderOrder: {
			type: "number",
			default: 0.01
		},
		z_position: {
			type: "number",
			default: 1
		}
	},
	getMesh: function() {

		const self = this;
		
		const materials = {};
		
		console.time(this.name);
		
		this.points = this.points
		.map(feature => {
			
			let expandedFeature = [];
			
			if (feature.geometry.type === "MultiLineString") {
				expandedFeature = feature.geometry.coordinates.map(coords => {
					
					const newFeature = {
						properties: {},
						geometry: {}
					};
					
					newFeature.properties = feature.properties;
					newFeature.geometry.type = "LineString";
					newFeature.geometry.coordinates = coords;
					return newFeature;
				});
			} else {
				expandedFeature.push(feature);
			}
			
			return expandedFeature;
		}).reduce((a, b) => a.concat(b));
				
		const lines = this.points
		.filter(feature => {
			return [
				"motorway",
				"primary",
				"secondary",
				"trail",
				"bus",
				"sc",
				"max",
				"at",
				"subway",
				"rt"
			].indexOf(feature.properties.type) !== -1;
		})
		.map(function(feature) {
			
			let width = 1;
			let color = consts.COLOR_ROADS_MINOR;
			
			if (feature.properties.type === "motorway") {
				width = 3;
				color = consts.COLOR_ROADS_MAJOR;
			} else if (feature.properties.type === "primary") {
				width = 3;
			} else if (feature.properties.type === "secondary") {
				width = 2;
			}
			
			if (["bus", "sc", "max", "at", "subway", "rt"].indexOf(feature.properties.type) !== -1) {
				color = consts.COLOR_ROADS_TRANSIT;
			}
			
			function getMaterial() {
				const tunnel = feature.properties.tunnel || false;
				const materialKey = width.toString() + color.toString() + tunnel.toString();
				
				let material = materials[materialKey];
				
				if (!material) {
					material = new MeshLineMaterial({
						lineWidth: 10 * width,//size of individual street
						sizeAttenuation: 1,
						opacity: tunnel ? 0.1 : 1,
						depthTest: tunnel ? false : true,
						transparent: tunnel ? true : false,
						color: new THREE.Color(color),
						blending: tunnel ? THREE.AdditiveAlphaBlending : THREE.AdditiveBlending
					});
					
					materials[materialKey] = material;
				}
				
				return material;
			}
			
			const coords = feature.geometry.coordinates;
						
			const lineGeometry = new Float32Array(coords.length * 3);
			
			coords.forEach((point, index) => {
				lineGeometry[index * 3 + 0] = point[0];
				lineGeometry[index * 3 + 1] = point[1];
				lineGeometry[index * 3 + 2] = 0;
			});

			const line = new MeshLine();
			line.setGeometry(lineGeometry);
			
			const mesh = new THREE.Mesh(line.geometry, getMaterial());
			mesh.renderOrder = self.renderOrder;
			mesh.position.z = self.z_position;
			mesh.matrixAutoUpdate = false;
			
			return mesh;
		});
		
		const plane = new THREE.Object3D();
		
		lines.forEach(line => plane.add(line));
		plane.renderOrder = this.renderOrder;
		plane.userData.hide_at_z = self.hide_at_z;
		console.timeEnd(this.name);
		return plane;
	}
});
