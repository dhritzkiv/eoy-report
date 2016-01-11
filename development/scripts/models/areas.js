"use strict";

const MapFeature = require("../models/map-feature");
const LakeMapFeature = require("../models/map-feature_lake");
const RoadMapFeature = require("../models/map-feature_road");
const LabelMapFeature = require("../models/map-feature_label");

const consts = require("../consts");

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
			new LakeMapFeature({
				name: "Lake Simcoe",
				geojson_uri: "/data/lake-simcoe-coastline.geojson"
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
			new MapFeature({
				name: "Toronto Parks",
				geojson_uri: "/data/toronto-parks.geojson",
				color: consts.COLOR_PARKS,
				renderOrder: 0.02
			}),
			new LabelMapFeature({
				name: "Toronto",
				points: [[-79.4, 43.7]],
				z_position: 1000,
				size: consts.LABEL_SIZE_METRO
			}),
			new LabelMapFeature({
				name: "Hamilton",
				points: [[-79.866091, 43.250021]],
				z_position: 500,
				size: consts.LABEL_SIZE_MEDIUM
			}),
			new LabelMapFeature({
				name: "Guelph",
				points: [[-80.248167, 43.544805]],
				z_position: 500,
				size: consts.LABEL_SIZE_MEDIUM
			}),
			new LabelMapFeature({
				name: "Oakville",
				points: [[-79.687666, 43.467517]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Barrie",
				points: [[-79.690332, 44.389356]],
				z_position: 500,
				size: consts.LABEL_SIZE_MEDIUM
			}),
			new LabelMapFeature({
				name: "Missisauga",
				points: [[-79.65, 43.6]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Oro-Medonte",
				points: [[-79.523333, 44.5]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Burlington",
				points: [[-79.8, 43.316667]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Vaughn",
				points: [[-79.5, 43.83333]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "King",
				points: [[-79.6044, 44.0463]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Bradford",
				points: [[-79.633333, 44.13333]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Innisfil",
				points: [[-79.583333, 44.3]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Pickering",
				points: [[-79.089, 43.8354]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Newmarket",
				points: [[-79.466667, 44.05]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			/*new LabelMapFeature({
				name: "Aurora",
				points: [[-79.466667, 44]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),*/
			new LabelMapFeature({
				name: "Broke Wrist Here",
				points: [[-79.545822, 44.112856]],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			}),
			new LabelMapFeature({
				name: "WayHome",
				points: [[-79.520159, 44.479942]],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			}),
			new LabelMapFeature({
				name: "YTZ",
				points: [[-79.396111, 43.6275]],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			}),
			new LabelMapFeature({
				name: "YYZ",
				points: [[-79.630556, 43.676667]],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			})
		]
	},
	lv: {
		name: "Las Vegas",
		projection: consts.PROJECTION_NEVADA_WEST,
		bounds: [	
			[-115.25, 35.5],
			[-114.75, 36.5]
		],
		features: [
			new MapFeature({
				geojson_uri: "/data/lv-box.geojson",
				renderOrder: -0.1,
				visible: false
			}),
			new MapFeature({
				geojson_uri: "/data/lv-commercial.geojson",
				color: "#eeddba"
			}),
			new MapFeature({
				geojson_uri: "/data/lv-parks.geojson",
				color: consts.COLOR_PARKS,
				renderOrder: 0
			}),
			new MapFeature({
				geojson_uri: "/data/lv-airport-features.geojson",
				color: consts.COLOR_AIRPORT_FEATURES,
				renderOrder: 0.01
			}),
			new MapFeature({
				geojson_uri: "/data/lv-airport-grounds.geojson",
				color: consts.COLOR_AIRPORT_GROUNDS,
				renderOrder: 0.001
			}),
			new RoadMapFeature({
				name: "Roads",
				geojson_uri: "/data/lv-roads.geojson"
			}),
			new LabelMapFeature({
				name: "Las Vegas",
				points: [[-115.136389, 36.175]],
				z_position: 500,
				size: consts.LABEL_SIZE_METRO
			}),
			new LabelMapFeature({
				name: "Las Vegas Strip",
				points: [[-115.172222, 36.120833]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "Las Vegas Strip",
				points: [[-115.172222, 36.120833]],
				z_position: 500,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "LAS",
				points: [[-115.152222, 36.08]],
				z_position: 500,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			})
		]
	},
	nyc: {
		name: "New York City",
		projection: consts.PROJECTION_NEW_YORK_ISLAND,
		bounds: [	
			[-74.25, 40.5],
			[-73.25, 41]
		],
		features: [
			new MapFeature({
				geojson_uri: "/data/new-york-city-admin.geojson",
				renderOrder: -0.02,
				visible: false
			}),
			new LakeMapFeature({
				name: "New York Coastline",
				geojson_uri: "/data/new-york-coastline.geojson"
			}),
			new MapFeature({
				name: "New York Airport Features",
				geojson_uri: "/data/newark-airport-grounds.geojson",
				color: consts.COLOR_AIRPORT_GROUNDS,
			}),
			new MapFeature({
				name: "New York Airport Features",
				geojson_uri: "/data/newark-airport-features.geojson",
				color: consts.COLOR_AIRPORT_FEATURES,
				renderOrder: 0.01
			}),
			new MapFeature({
				name: "New York Parks",
				geojson_uri: "/data/new-york-parks.geojson",
				color: consts.COLOR_PARKS,
				renderOrder: 0.015
			}),
			new RoadMapFeature({
				name: "MTA",
				geojson_uri: "/data/new-york-subway.geojson",
				renderOrder: 0.02
			}),
			new LabelMapFeature({
				name: "Manhattan",
				points: [[-73.959722, 40.790278]],
				z_position: 500,
				size: consts.LABEL_SIZE_METRO
			}),
			new LabelMapFeature({
				name: "Brooklyn",
				points: [[-73.990278, 40.692778]],
				z_position: 500,
				size: consts.LABEL_SIZE_METRO
			}),
			new LabelMapFeature({
				name: "Newark",
				points: [[-74.172367, 40.735657]],
				z_position: 20,
				size: consts.LABEL_SIZE_SMALL
			}),
			new LabelMapFeature({
				name: "EWR",
				points: [[-74.168611, 40.6925]],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			}),
			/*new LabelMapFeature({
				name: "WTC",
				position: new THREE.Vector3(-74.0125, 40.711667, 0.001),
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 0.05
			}),
			new LabelMapFeature({
				name: "High Line",
				position: new THREE.Vector3(-74.005, 40.748333, 0.001),
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 0.05
			}),
			new LabelMapFeature({
				name: "UN Building",
				position: new THREE.Vector3(-73.968056, 40.749444, 0.001),
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 0.05
			}),
			new LabelMapFeature({
				name: "Flatiron Building",
				position: new THREE.Vector3(-73.989722, 40.741111, 0.001),
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 0.05
			}),
			new LabelMapFeature({
				name: "Williamsburg",
				position: new THREE.Vector3(-73.95333, 40.713333, 0.001),
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 0.05
			}),
			new LabelMapFeature({
				name: "Chinatown",
				position: new THREE.Vector3(-73.997222, 40.714722, 0.001),
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 0.05
			}),
			new LabelMapFeature({
				name: "SoHo",
				position: new THREE.Vector3(-74.000833, 40.723056, 0.001),
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 0.05
			})*/
		]
	},
	pdx: {
		name: "Portland",
		projection: consts.PROJECTION_OREGON_NORTH,
		bounds: [	
			[-123, 45],
			[-122, 46]
		],
		features: [
			new MapFeature({
				geojson_uri: "/data/portland-boundaries.geojson",
				renderOrder: -0.02,
				visible: false
			}),
			new LakeMapFeature({
				geojson_uri: "/data/portland-river-coasts.geojson"
			}),
			new MapFeature({
				geojson_uri: "/data/portland-airport-grounds.geojson",
				color: consts.COLOR_AIRPORT_GROUNDS,
			}),
			new MapFeature({
				geojson_uri: "/data/portland-airport-features.geojson",
				color: consts.COLOR_AIRPORT_FEATURES,
				renderOrder: 0.01
			}),
			new MapFeature({
				geojson_uri: "/data/portland-parks.geojson",
				color: consts.COLOR_PARKS,
				renderOrder: 0.01
			}),
			new RoadMapFeature({
				name: "Trimet",
				geojson_uri: "/data/portland-bus-routes-merged-joined_fixed.geojson",
				renderOrder: 0.02,
				hide_at_z: 6500
			}),
			new LabelMapFeature({
				name: "Portland",
				points: [[-122.681944, 45.52]],
				z_position: 20,
				size: consts.LABEL_SIZE_METRO,
			}),
			new LabelMapFeature({
				name: "PDX",
				points: [[-122.5975, 45.588611]],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			}),
			new LabelMapFeature({
				name: "XOXO",
				points: [[-122.652, 45.518972]],
				z_position: 20,
				size: consts.LABEL_SIZE_NANO,
				hide_at_z: 6500
			})
		]
	},
	surrey: {
		name: "Surrey",
		bounds: [
			[-122.95, 48.75],
			[-122.25, 49.25]
		],
		features: [
			new MapFeature({
				geojson_uri: "/data/surrey-box.geojson",
				renderOrder: -0.02,
				visible: false
			}),
			new LakeMapFeature({
				geojson_uri: "/data/surrey-coastline.geojson"
			}),
			new MapFeature({
				geojson_uri: "/data/surrey-parks.geojson",
				color: consts.COLOR_PARKS
			}),
			new RoadMapFeature({
				name: "Roads",
				geojson_uri: "/data/surrey-roads.geojson"
			})
		]
	}
};