"use strict";

const MapFeature = require("../models/map-feature");
const LakeMapFeature = require("../models/map-feature_lake");
//const RoadMapFeature = require("../models/map-feature_road");
const LabelMapFeature = require("../models/map-feature_label");

const consts = require("../consts");

/*[
	{
		"name": "Toronto",
		"projection": "MTM10",
		"bounds": [
			[-81, 42],
			[-78, 45]
		],
		"features": [
			{
				"name": "Toronto Border",
				"geojson_uri": "/data/toronto-border.geojson"
			},
			{
				"name": "Lake Ontario",
				"geojson_uri": "/data/lake-ontario-coastline.geojson"
			}
		]
	}
]*/

module.exports = {
	to: {
		name: "Toronto",
		projection: consts.PROJECTION_MTM10,
		bounds: [
			[-81, 42],
			[-78, 45]
		],
		features: [
			new MapFeature({
				geojson_uri: "/data/toronto-border.geojson",
				visible: false
			}),
			new LakeMapFeature({
				name: "Lake Ontario",
				geojson_uri: "/data/lake-ontario-coastline.geojson"
			}),
			new MapFeature({
				name: "Billy Bishop Grounds",
				geojson_uri: "/data/ytz-airport-grounds.geojson",
				color: consts.COLOR_AIRPORT_GROUNDS,
				renderOrder: 0.005
			}),
			new MapFeature({
				name: "Billy Bishop Features",
				geojson_uri: "/data/ytz-airport-features.geojson",
				color: consts.COLOR_AIRPORT_FEATURES,
				renderOrder: 0.01
			}),
			new MapFeature({
				name: "Pearson Grounds",
				geojson_uri: "/data/yyz-airport-grounds.geojson",
				color: consts.COLOR_AIRPORT_GROUNDS,
				renderOrder: 0.005
			}),
			new MapFeature({
				name: "Pearson Features",
				geojson_uri: "/data/yyz-airport-features.geojson",
				color: consts.COLOR_AIRPORT_FEATURES,
				renderOrder: 0.01
			}),
			new LabelMapFeature({
				name: "Toronto",
				points: [ [-79.4, 43.7] ],
				z_position: 1000,
				size: consts.LABEL_SIZE_METRO
			}),
			new LabelMapFeature({
				name: "Guelph",
				points: [ [-80.248167, 43.544805] ],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Mississauga",
				points: [ [-79.65, 43.6] ],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Burlington",
				points: [ [-79.8, 43.316667] ],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Vaughan",
				points: [ [-79.5, 43.83333] ],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Pickering",
				points: [ [-79.089, 43.8354] ],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Oshawa",
				points: [ [-78.885556, 43.870556] ],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Bowmanville",
				points: [ [-78.6875, 43.911389] ],
				z_position: 501,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "YTZ",
				points: [ [-79.396111, 43.6275] ],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 4000
			}),
			new LabelMapFeature({
				name: "YYZ",
				points: [ [-79.630556, 43.676667] ],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 4000
			})
		]
	}
};
