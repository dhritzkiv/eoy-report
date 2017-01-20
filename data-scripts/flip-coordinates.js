"use strict";

const fs = require("fs");
const path = require("path");

const inPath = path.join(process.cwd(), process.argv[2]);
const outPath = path.join(process.cwd(), process.argv[3]);

const src = fs.readFileSync(inPath, "utf8");

let rides = JSON.parse(src);//json string to JS object

rides = rides
.filter(({points}) => points && points.length)
.forEach(ride => (ride.points = ride.points.map(([a, b]) => [b, a])));

const data = JSON.stringify(rides, null, "\t");

fs.writeFileSync(outPath, data);
