"use strict";

const fs = require("fs");
const interpolateLineRange = require("line-interpolate-points");
const path = require("path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);
const tolerance = parseFloat(process.argv[4]) || 0.0025;

fs.readFile(inPath, "utf8", function(err, src) {
	
	let paths = JSON.parse(src);//json string to JS object
	
	//paths.reverse();//oldest first
	
	const averagePointCount = paths
	.map(path => path.points.length)
	.reduce((total, pointsLength) => total + pointsLength) / paths.length;
	
	const interopPointsCount = averagePointCount;
	
	function filterByGreaterDateOrGreaterIndexPosition(rideA) {
		return function(rideB, index) {
			if (rideB.start_date_local) {
				return new Date(rideB.start_date_local) > new Date(rideA.start_date_local);
			} else {
				return index > paths.indexOf(rideA);
			}
		}
	}
	
	paths = paths.filter(path => path.points.length > 2);
	
	paths.forEach(function(rideA) {
		
		const rideAPoints = interpolateLineRange(rideA.points, interopPointsCount);
		
		paths
		//rideB isn't rideA
		.filter(rideB => rideA !== rideB)
		//rideB hasn't already been marked a dupe
		.filter(rideB => !rideB.dupe)
		//rideB comes after rideA
		.filter(filterByGreaterDateOrGreaterIndexPosition(rideA))
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
			
			rideB.dupe = averageDistanceDiff <= tolerance;//true
		});
	});
	
	console.log("rides before: %d", paths.length);
	
	paths = paths.filter(path => !path.dupe);
	paths.reverse();
	
	console.log("rides after: %d", paths.length);
	
	fs.writeFile(outPath, JSON.stringify(paths, null, "\t"), {
		encoding: "utf8"
	}, function(err) {
		console.log(err || "done!");
	});
});