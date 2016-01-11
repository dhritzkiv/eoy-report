"use strict";

const fs = require("fs");
const path = require("path");
const simplify = require("simplify-path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

const tolerance = 0.00005;
	
const reducePoints = (total, ride) => total + ride.points.length;

fs.readFile(inPath, "utf8", function(err, src) {
	
	let paths = JSON.parse(src);//json string to JS object
	const originalPointCount = paths.reduce(reducePoints, 0);
	
	const startTime = Date.now();
	
	paths = paths.map(function(ride) {
		ride.points = simplify(ride.points, tolerance);
		return ride;
	});
	
	const finalPointCount = paths.reduce(reducePoints, 0);
	
	console.log("starting points: %d", originalPointCount);
	console.log("final points: %d", finalPointCount);
	console.log("task time: %d ms", Date.now() - startTime);
	
	fs.writeFile(outPath, JSON.stringify(paths, null, "\t"), {
		encoding: "utf8"
	}, function(err) {
		console.log(err || "write complete");
	})
});
