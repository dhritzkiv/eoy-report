"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const util_1 = require("util");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
const { _: [inFile, outFile], boundary: boundingString } = args;
const boundary = [];
if (boundingString) {
    try {
        const parsed = JSON.parse(boundingString);
        boundary.push(...parsed);
    }
    catch (e) { }
    assert.equal(boundary.length, 2, "Invalid bounding argument");
}
assert.ok(inFile, "Missing input file argument");
assert.ok(outFile, "Missing output file argument");
const asyncReadFile = util_1.promisify(fs.readFile);
const asyncWriteFile = util_1.promisify(fs.writeFile);
const main = async () => {
    const inJSON = await asyncReadFile(inFile, "utf8");
    const walks = JSON.parse(inJSON);
    const feature = {
        type: "Feature",
        properties: {
            type: "walk"
        },
        geometry: {
            type: "MultiLineString",
            coordinates: walks
                .filter(walk => walk.points)
                .filter(walk => (!boundary.length ||
                walk.points.every(tuple => tuple.every((a, i) => (a > boundary[0][i] &&
                    a < boundary[1][i])))))
                .map(walk => walk.points)
        }
    };
    const geojson = {
        "type": "FeatureCollection",
        features: [feature]
    };
    const outJSON = JSON.stringify(geojson, null, "\t");
    await asyncWriteFile(outFile, outJSON);
};
main();
//# sourceMappingURL=walks-to-geojson.js.map