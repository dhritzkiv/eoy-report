"use strict";

const THREE = require("three");
const MapFeature = require("./map-feature");
const consts = require("../consts");
const proj4 = require("proj4");

module.exports = MapFeature.extend({
	props: {
		renderOrder: {
			type: "number",
			default: 1
		},
		z_position: {
			type: "number",
			default: 10
		},
		size: {
			type: "number",
			default: 0.5
		}
	},
	convertPointsForProjection: function(projection) {
		const applyProjectionToPoint = (point) => proj4(consts.PROJECTION_WGS84, projection, point);

		this.projected_points = this.points.map(applyProjectionToPoint);
	},
	getMesh: function() {

		console.time(this.name);

		const fontFamily = `Knockout-HTF52-Cruiserweight`;//`"futura-pt", "Futura PT", Futura, sans-serif`;

		let labelText = this.name;
		const point = this.projected_points[0];
		const size = this.size;

		if (size >= 0.65) {
			labelText = labelText.toUpperCase();
		}

		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		const dimension = 512 * size;

		canvas.width = dimension;
		canvas.height = dimension;

		context.textAlign = "center";
		context.textBaseline = "middle";
		const fontSize = dimension / 4 * size;
		const fontWeight = 700;

		context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

		context.strokeStyle = consts.COLOR_LAND;
		context.lineWidth = (Math.floor(Math.sqrt(canvas.width)) * 0.5) * (size / 0.5);
		context.lineCap = "round";
		context.lineJoin = "round";
		context.strokeText(labelText, canvas.width / 2, canvas.height / 2);

		context.fillStyle = "#e36e5f";//consts.COLOR_TEXT;
		context.fillText(labelText, canvas.width / 2, canvas.height / 2);

		const textLabelMap = new THREE.Texture(canvas);

		//textLabelMap.anisotropy = 16;//renderer.getMaxAnisotropy();
		textLabelMap.magFilter = THREE.LinearFilter;//THREE.NearestFilter;
		textLabelMap.minFilter = THREE.LinearFilter;
		textLabelMap.needsUpdate = true;
		textLabelMap.premultiplyAlpha = true;

		const labelMaterial = new THREE.SpriteMaterial({
			map: textLabelMap,
			transparent: true
		});

		labelMaterial.depthWrite = false;

		labelMaterial.blending = THREE.CustomBlending;
		labelMaterial.blendSrc = THREE.OneFactor;

		const sprite = new THREE.Sprite(labelMaterial);

		sprite.renderOrder = consts.RENDER_ORDER_LABELS;

		sprite.position.set(point[0], point[1], this.z_position * size);
		sprite.userData.hide_at_z = this.hide_at_z;
		sprite.name = this.name;

		console.timeEnd(this.name);

		return sprite;
	}
});
