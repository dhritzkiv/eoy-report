import State from "ampersand-state";

const MapArea = State.extend({
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

export default MapArea;
