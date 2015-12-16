"use strict";

const fs = require("fs");
const path = require("path");
const simplify = require("simplify-js");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

const tolerance = 0.00025;
	
const reducePoints = (total, ride) => total + ride.points.length;

fs.readFile(inPath, "utf8", function(err, src) {
	
	let rides = JSON.parse(src);//json string to JS object
	const originalPointCount = rides.reduce(reducePoints, 0);
	
	const startTime = Date.now();
	
	rides = rides.map(function(ride) {
		const srcPointsObjectArray = ride.points.map(point => {
			return {
				x: point[0],
				y: point[1]
			}
		});
		
		const simplifiedPoints = simplify(srcPointsObjectArray, tolerance, true);
		
		ride.points = simplifiedPoints.map(point => [point.x, point.y]);
		
		return ride;
	});
	
	const finalPointCount = rides.reduce(reducePoints, 0);
	
	console.log("starting points: %d", originalPointCount);
	console.log("final points: %d", finalPointCount);
	console.log("task time: %d ms", Date.now() - startTime);
	
	fs.writeFile(outPath, JSON.stringify(rides, null, "\t"), {
		encoding: "utf8"
	}, function(err) {
		console.log(err || "write complete");
	})
});