"use strict";

const fs = require("fs");
const interpolateLineRange = require("line-interpolate-points");
const path = require("path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);
const tolerance = parseFloat(process.argv[4]) || 0.0025;

const filterByGreaterDateOrGreaterIndexPosition = (pathA, paths) => (pathB, index) => {
	if (pathB.start_date_local) {
		return new Date(pathB.start_date_local) > new Date(pathA.start_date_local);
	} else {
		return index > paths.indexOf(pathA);
	}
};

const distanceDiffForTwoPaths = (a, b) => a
.map((aPoint, index) => [aPoint, b[index]])
.map(([ [x1, y1], [x2, y2] ]) => Math.hypot(x1 - x2, y1 - y2))
.reduce((total, distance) => total + distance, 0);

const src = fs.readFileSync(inPath, "utf8");

let paths = JSON.parse(src);//json string to JS object

//paths.reverse();//oldest first

const averagePointCount = paths
.filter(({points}) => points)
.map(({points}) => points.length)
.reduce((total, pointsLength) => total + pointsLength) / paths.length;

const interopPointsCount = averagePointCount;

paths = paths.filter(path => path.points && path.points.length > 2);

paths = paths.map(path => [
	interpolateLineRange(path.points, interopPointsCount),
	path
]);

paths.forEach(([pathAPoints, pathA]) => {
	const memoizedFilter = filterByGreaterDateOrGreaterIndexPosition(pathA, paths);

	paths
	//pathB isn't pathA
	.filter(([, pathB]) => pathA !== pathB)
	//pathB hasn't already been marked a dupe
	.filter(([, pathB]) => !pathB.dupe)
	//pathB comes after pathA
	.filter(([, pathB], index) => memoizedFilter(pathB, index))
	.forEach(([pathBPoints, pathB]) => {

		const totalDistanceDiff = distanceDiffForTwoPaths(pathAPoints, pathBPoints);
		const averageDistanceDiff = totalDistanceDiff / interopPointsCount;

		pathB.dupe = averageDistanceDiff <= tolerance;

		if (pathB.dupe) {
			return;
		}

		//reverse the pathB, since we don't care about directionality
		const totalDistanceDiffReverse = distanceDiffForTwoPaths(pathAPoints, pathBPoints.slice(0).reverse());
		const averageDistanceDiffReverse = totalDistanceDiffReverse / interopPointsCount;

		pathB.dupe = averageDistanceDiffReverse <= tolerance;
	});
});

paths = paths.map(([, path]) => path);

console.log("rides before: %d", paths.length);

paths = paths.filter(path => !path.dupe);
paths.reverse();

console.log("rides after: %d", paths.length);

const data = JSON.stringify(paths, null, "\t");

fs.writeFileSync(outPath, data);

console.log("done!");
