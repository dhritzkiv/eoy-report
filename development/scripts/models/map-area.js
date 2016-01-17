"use strict";

const State = require("ampersand-state");

module.exports = State.extend({
	props: {
		name: {
			type: "string"
		},
		text: {
			type: "string"
		},
		sources: {
			type: "array",
			default: () => []
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
