import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import {promisify} from "util";
import * as strava from "strava-v3";
import * as minimist from "minimist";
import {Ride} from "./strava-activities";
import {GeoJSON as GeoJSONFeature, LatLonTuple} from "@mapbox/polyline";

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

	const rides: {points: number[][], id: string}[] = JSON.parse(inJSON);

	/*const features = rides
	.filter(ride => ride.points)
	.filter(ride => (
		!boundary.length ||
		ride.points.every(tuple => tuple.every((a, i) => (
			a > boundary[0][i] &&
			a < boundary[1][i]
		)))
	))
	.map(ride => {
		const feature: GeoJSONFeature = {
			type: "Feature",
			properties: {
				id: ride.id
			},
			geometry: {
				type: "LineString",
				coordinates: <LatLonTuple[]>ride.points.slice(0)
			}
		};

		return feature;
	});*/

	const feature = {
		type: "Feature",
		properties: {
			type: "cycle"
		},
		geometry: {
			type: "MultiLineString",
			coordinates: <LatLonTuple[][]> rides
			.filter(ride => ride.points)
			.filter(ride => (
				!boundary.length ||
				ride.points.every(tuple => tuple.every((a, i) => (
					a > boundary[0][i] &&
					a < boundary[1][i]
				)))
			))
			.map(ride => ride.points)
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
