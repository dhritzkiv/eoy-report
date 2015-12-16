"use strict";

const fs = require("fs");
const interpolateLineRange = require("line-interpolate-points");
const path = require("path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

fs.readFile(inPath, "utf8", function(err, src) {
	
	let rides = JSON.parse(src);//json string to JS object
	
	rides = rides.map(ride => {
		ride.points = ride.points.map(point => [point[1], point[0]])
		return ride;
	});
	
	fs.writeFile(outPath, JSON.stringify(rides, null, "\t"), {
		encoding: "utf8"
	}, function(err) {
		console.log(err || "done!");
	});
});