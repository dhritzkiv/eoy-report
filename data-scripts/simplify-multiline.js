"use strict";

const fs = require("fs");
const path = require("path");
const simplify = require("simplify-path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

const tolerance = 0.0005;
const diffTolerance = 0.0035;

//const reducePoints = (total, ride) => total + ride.points.length;

const getDistanceBetweenPoints = ([x1, y1], [x2, y2]) => Math.hypot(x1 - x2, y1 - y2);

const src = fs.readFileSync(inPath, "utf8");

const data = JSON.parse(src);//json string to JS object

//const startTime = Date.now();

data.features = data.features.map((feature) => {

	feature.properties.type = feature.properties.type || feature.properties.TYPE.toLowerCase();
	feature.properties.frequent = feature.properties.frequent || feature.properties.FREQUENT.toLowerCase();

	//const newCoordinates = [];
	const coordinates = feature.geometry.coordinates;

	const pushPoint = (point, i) => coordinates[i - 1].push(point);

	for (let i = 0; i < coordinates.length; i++) {

		if (!i) {
			continue;
		}

		const coord = coordinates[i];
		const coord2 = coordinates[i - 1];

		const dist = getDistanceBetweenPoints(coord[0], coord2[coord2.length - 1]);

		if (dist < diffTolerance) {
			coord.forEach(point => pushPoint(point, i));
			coordinates.splice(i, 1);
			i--;
		}

	}

	const countPoints = coords => coords
	.map(coord => coord.length)
	.reduce((a, b) => a + b);

	console.log("before", countPoints(coordinates));
	feature.geometry.coordinates = coordinates.map(coord => simplify(coord, tolerance));
	console.log("after", countPoints(feature.geometry.coordinates));

	return feature;
});

fs.writeFileSync(outPath, JSON.stringify(data, null, "\t"), {
	encoding: "utf8"
});

console.log("write complete");
