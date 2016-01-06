"use strict";

const fs = require("fs");
const path = require("path");
const simplify = require("simplify-path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

const tolerance = 0.0005;
const diffTolerance = 0.0035;
	
const reducePoints = (total, ride) => total + ride.points.length;

const getDistanceBetweenPoints = (a, b) => {
	const x1 = a[0];
	const y1 = a[1];
	const x2 = b[0];
	const y2 = b[1];
	
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

fs.readFile(inPath, "utf8", function(err, src) {
	
	const data = JSON.parse(src);//json string to JS object
	
	const startTime = Date.now();
	
	data.features = data.features.map(function(feature) {
		
		feature.properties.type = feature.properties.type || feature.properties.TYPE.toLowerCase();
		feature.properties.frequent = feature.properties.frequent || feature.properties.FREQUENT.toLowerCase();
		
		//const newCoordinates = [];
		const coordinates = feature.geometry.coordinates;
		
		for (let i = 0; i < coordinates.length; i++) {
			
			if (!i) {
				continue;
			}
			
			let coord = coordinates[i];
			let coord2 = coordinates[i - 1];
			
			let dist = getDistanceBetweenPoints(coord[0], coord2[coord2.length - 1]);
			
			if (dist < diffTolerance) {
				
				coord.forEach(point => coordinates[i - 1].push(point));
				coordinates.splice(i, 1);
				i--;
				
			}
			
		}
		
		const countPoints = coords => coords
		.map(coord => coord.length)
		.reduce((a, b) => a + b);
		
		console.log("before", countPoints(coordinates))
		feature.geometry.coordinates = coordinates.map(coord => simplify(coord, tolerance));
		console.log("after", countPoints(feature.geometry.coordinates))

		return feature;
	});
	
	fs.writeFile(outPath, JSON.stringify(data, null, "\t"), {
		encoding: "utf8"
	}, function(err) {
		console.log(err || "write complete");
	})
});