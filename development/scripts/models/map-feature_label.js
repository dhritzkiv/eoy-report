"use strict";

const THREE = require("three.js");
const MapFeature = require("./map-feature");
const consts = require("../consts");

module.exports = MapFeature.extend({
	props: {
		renderOrder: {
			type: "number",
			default: 1
		},
		z_position: {
			type: "number",
			default: 0.005
		},
		position: {
			type: "object",
			default: () => new THREE.Vector3(0, 0, 0.01)
		},
		size: {
			type: "number",
			default: 0.5
		}
	},
	getMesh: function() {

		const self = this;
		
		const materials = {};
		
		console.time(this.name);
		
		const fontFamily = `"Futura PT", Futura, sans-serif`;
		
		let labelText = this.name;
		const position = this.position;
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
		const fontSize = canvas.width / 8 * size;
		const fontWeight = size > 0.75 ? 700 : 400;
		context.font = `${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;
		
		context.strokeStyle = consts.COLOR_LAND;
		context.lineWidth = (Math.floor(Math.sqrt(canvas.width)) * 0.5) * (size / 0.5);
		context.lineCap = "round";
		context.lineJoin = "round";
		context.strokeText(labelText, canvas.width / 2, canvas.height / 2);
		
		context.fillStyle = consts.COLOR_TEXT;
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
		sprite.renderOrder = consts.RENDER_ORDER_LABELS;
		
		sprite.position.set(position.x, position.y, position.z * size);
		sprite.userData.hide_at_z = this.hide_at_z;
		
		//labelSprites.push(sprite);
		
		console.timeEnd(this.name);
		
		return sprite;
	}
});