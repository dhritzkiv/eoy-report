"use strict";

const MapFeature = require("./map-feature");
const consts = require("../consts");

module.exports = MapFeature.extend({
	props: {
		color: {
			type: "string",
			default: consts.COLOR_WATER
		},
		renderOrder: {
			type: "number",
			default: -0.01
		}
	}
});