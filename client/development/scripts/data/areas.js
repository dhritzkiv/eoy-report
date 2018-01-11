
/**
 * @typedef LabelGeoJSON
 * @property {string} type
 * @property {{type: string, text: string, size: number}} properties
 * @property {{type: string, coordinates: [number, number]}} geometry
 */

/**
 *
 * @param {string} text
 * @param {[number, number]} point
 * @param {number} size
 * @returns {LabelGeoJSON}
 */
const makeGeoJSONTextLabelForPoint = (text, point, size = 1) => ({
	type: "Feature",
	properties: {
		type: "text",
		text,
		size
	},
	geometry: {
		"type": "Point",
		"coordinates": point
	}
});

/**
 * @typedef Layer
 * @property {LabelGeoJSON} [geojson]
 * @property {string} [uri]
 */

/**
 * @typedef Area
 * @property {[[number, number], [number, number]]} extent
 * @property {Layer[]} baseLayers
 * @property {Layer[]} labelLayers
 */

/**
 * @type {Area}
 */
const toronto = {
	extent: [
		[-80.125, 42.8667],
		[-78.9, 44.7501]
	],
	baseLayers: [
		{
			uri: "/data/toronto-green.geojson"
		},
		{
			uri: "/data/gtha-waters.geojson"
		},
		{
			uri: "/data/lake-simcoe.geojson"
		},
		{
			uri: "/data/ytz-airport-grounds.geojson"
		},
		{
			uri: "/data/yyz-airport-grounds.geojson"
		}
	],
	labelLayers: [
		{
			geojson: makeGeoJSONTextLabelForPoint("Toronto", [-79.383558, 43.652503])
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Hamilton", [-79.866091, 43.250021], 0.75)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Mississauga", [-79.65, 43.6], 0.75)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Oakville", [-79.687666, 43.467517], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Burlington", [-79.8, 43.316667], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Vaughan", [-79.5, 43.83333], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Newmarket", [-79.466667, 44.05], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("St. Catherines", [-79.233333, 43.183333], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Niagara Falls", [-79.106667, 43.06], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Barrie", [-79.690332, 44.389356], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Oro-Medonte", [-79.523333, 44.5], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Markham", [-79.263333, 43.876667], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("King", [-79.6044, 44.0463], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Caledon", [-79.866667, 43.866667], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Mono", [-80.066667, 44.016667], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Bradford", [-79.633333, 44.13333], 0.5)
		},
		{
			geojson: makeGeoJSONTextLabelForPoint("Innisfil", [-79.583333, 44.3], 0.5)
		}
	]
};

/**
 * @type {Area}
 */
const auckland = {
	extent: [
		[174.655, -37.0167],
		[175.254, -36.675]
	],
	baseLayers: [
		{
			uri: "/data/auckland-green.geojson"
		},
		{
			uri: "/data/auckland-coastline.geojson"
		}
	],
	labelLayers: [
		{
			geojson: makeGeoJSONTextLabelForPoint("Auckland", [174.765, -36.847])
		}
	]
};

/**
 * @type {Area}
 */
const sydney = {
	baseLayers: [
		{
			uri: "/data/sydney-green.geojson"
		},
		{
			uri: "/data/sydney-coastline.geojson"
		}
	],
	labelLayers: [
		{
			geojson: makeGeoJSONTextLabelForPoint("Sydney", [151.212222, -33.868056])
		}
	]
};

/**
 * @type {Area}
 */
const melbourne = {
	baseLayers: [
		{
			uri: "/data/melbourne-green.geojson"
		},
		{
			uri: "/data/melbourne-coastline.geojson"
		}
	],
	labelLayers: [
		{
			geojson: makeGeoJSONTextLabelForPoint("Melbourne", [144.963, -37.814])
		}
	]
};

/**
 * @type {Area}
 */
const montreal = {
	extent: [
		[-73.7698, 45.3262],
		[-73.2987, 45.8579]
	],
	baseLayers: [
		{
			uri: "/data/montreal-green.geojson"
		},
		{
			uri: "/data/montreal-coastline.geojson"
		}
	],
	labelLayers: [
		{
			geojson: makeGeoJSONTextLabelForPoint("Montreal", [-73.57, 45.5])
		}
	]
};

/**
 * @type {Area}
 */
const vancouver = {
	baseLayers: [
		{
			uri: "/data/vancouver-green.geojson"
		},
		{
			uri: "/data/vancouver-coastline.geojson"
		}
	],
	labelLayers: [
		{
			geojson: makeGeoJSONTextLabelForPoint("Vancouver", [-123.1, 49.25])
		}
	]
};

export {toronto, auckland, sydney, melbourne, montreal, vancouver};
