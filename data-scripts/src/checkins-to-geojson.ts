import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import {promisify} from "util";
import * as strava from "strava-v3";
import * as minimist from "minimist";
import {GeoJSON as GeoJSONFeature, LatLonTuple} from "@mapbox/polyline";
import { SimpleFoursquareCheckin } from "./utils";

const args = minimist(process.argv.slice(2));
const {_: [inFile, outFile], boundary: boundingString} = args;
const boundary: number[][] = [];

if (boundingString) {
	try {
		const parsed: [number[], number[]] = JSON.parse(boundingString);

		boundary.push(...parsed);
	} catch (e) {}

	assert.equal(boundary.length, 2, "Invalid bounding argument");
}

assert.ok(inFile, "Missing input file argument");
assert.ok(outFile, "Missing output file argument");

const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);

interface GeoJSON {
	features: any[],//GeoJSONFeature[]
	[x: string]: any
}

const main = async () => {
	const inJSON = await asyncReadFile(inFile, "utf8");

	const checkins: SimpleFoursquareCheckin[] = JSON.parse(inJSON);
	const venueMap = new Map<string, SimpleFoursquareCheckin["venue_location"]>();

	checkins.forEach(checkin => venueMap.set(checkin.venue_id, checkin.venue_location));

	const feature = {
		type: "Feature",
		properties: {
			type: "checkin"
		},
		geometry: {
			type: "MultiPoint",
			coordinates: <LatLonTuple[]> [...venueMap.values()]
			.map(({lat, lng}) => [lng, lat])
			.filter((tuple) => (
				!boundary.length ||
				tuple.every((a, i) => (
					a > boundary[0][i] &&
					a < boundary[1][i]
				))
			))
		}
	};

	const geojson: GeoJSON = {
		"type": "FeatureCollection",
		features: [feature]
	};

	const outJSON = JSON.stringify(geojson, null, "\t");

	await asyncWriteFile(outFile, outJSON);
};

main();
