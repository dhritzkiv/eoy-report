"use strict";

const fs = require("fs");
const path = require("path");
const simplify = require("simplify-path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

const tolerance = 0.00005;

const reducePoints = (total, {points}) => total + points.length;

const src = fs.readFileSync(inPath, "utf8");

let paths = JSON.parse(src);//json string to JS object
const originalPointCount = paths.reduce(reducePoints, 0);

const startTime = Date.now();

paths.forEach((ride) => (ride.points = simplify(ride.points, tolerance)));

const finalPointCount = paths.reduce(reducePoints, 0);

console.log("starting points: %d", originalPointCount);
console.log("final points: %d", finalPointCount);
console.log("task time: %d ms", Date.now() - startTime);

const data = JSON.stringify(paths, null, "\t");

fs.writeFileSync(outPath, data);

console.log("write complete");
