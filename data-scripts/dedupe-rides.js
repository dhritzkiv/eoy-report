"use strict";

const fs = require("fs");
const interpolateLineRange = require("line-interpolate-points");
const path = require("path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

const tolerance = 0.0025;

let total = 0;

fs.readFile(inPath, "utf8", function(err, src) {
	
	let rides = JSON.parse(src);//json string to JS object
	
	rides.reverse();//oldest first
	
	rides.forEach(function(rideA) {
	
		const interopPointsCount = 20;	
		const rideAPoints = interpolateLineRange(rideA.points, interopPointsCount);
		
		rides
		.filter(rideB => rideA !== rideB)
		.filter(rideB => !rideB.dupe)
		.filter(rideB => new Date(rideB.start_date_local) > new Date(rideA.start_date_local))
		.forEach(function(rideB) {
			const rideBPoints = interpolateLineRange(rideB.points, interopPointsCount);
			
			const totalDistanceDiff = rideAPoints.map(function(rideAPoint, index) {
				const rideBPoint = rideBPoints[index];
				const x1 = rideAPoint[0];
				const y1 = rideAPoint[1];
				const x2 = rideBPoint[0];
				const y2 = rideBPoint[1];
				
				return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));		
			}).reduce((total, distance) => total + distance, 0);
			
			const averageDistanceDiff = totalDistanceDiff / interopPointsCount;
			
			if (averageDistanceDiff <= tolerance) {				
				rideB.dupe = true;
				//console.log(`"${rideA.name}" and "${rideB.name}" are similar. Ride distance difference of (${rideA.distance - rideB.distance}m)`);
			}
		});
	});
	
	rides.reverse();
	
	fs.writeFile(outPath, JSON.stringify(rides, null, "\t"), {
		encoding: "utf8"
	}, function(err) {
		console.log(err || "done!");
	});
});