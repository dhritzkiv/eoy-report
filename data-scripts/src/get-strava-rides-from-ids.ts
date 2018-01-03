
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import {promisify} from "util";
import * as strava from "strava-v3";
import * as async from "async";
import * as minimist from "minimist";
import Ride, {Activity} from "./strava-activities";

const args = minimist(process.argv.slice(2));
const {_: [inFile, outFile], c: configPath = "../../data/strava_config.json"} = args;

assert.ok(inFile, "Missing input file argument");
assert.ok(outFile, "Missing output file argument");

const stravaConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, configPath), "utf8"));

const RATE_LIMIT_RESET_IN_MINUTES = 15;

const asyncDelay = promisify(setTimeout);

class CustomError extends Error {
	errors: object[];
}

interface GetActivityArg {
	id: number;
	access_token: string;
}

interface LimitsObject {
	shortTermUsage: number;
	shortTermLimit: number;
	longTermUsage: number;
	longTermLimit: number;
}

interface RideResponseObject extends Activity {
	errors: object[];
}

const asyncGetActivity = (arg: GetActivityArg) : Promise<[RideResponseObject, LimitsObject]> => new Promise((resolve, reject) => {
	strava.activities.get(arg, (err: Error, ride: RideResponseObject, limits: LimitsObject) => {
		if (err) {
			return reject(err);
		}

		if (ride.errors) {
			const err = new CustomError();

			err.errors = ride.errors;

			return reject(err);
		}

		resolve([ride, limits]);
	});
});

const padRec = (value: string, paddingNumber: number, length: number) => value.length >= length ? value : padRec(`${paddingNumber}${value}`, paddingNumber, length);

const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);

const getRideById = async (id) => strava.activities.get({id}, (err, rideData) => {

	if (err) {
		throw err;
	}

	if (rideData.errors) {
		throw new Error(rideData.message);
	}

	const ride = new Ride(rideData);
});

const getRidesByIds = async (rideIds: number[]) => {
	const rides: Ride[] = [];

	for (const id of rideIds) {
		const [rideResponse, limits] = await asyncGetActivity({
			id,
			access_token: stravaConfig.access_token
		});

		const ride = new Ride(rideResponse);

		if (limits && limits.shortTermUsage + 1 >= limits.shortTermLimit) {
			const minutesPast = ((new Date()).getUTCMinutes()) % RATE_LIMIT_RESET_IN_MINUTES;
			const minutesRemaining = RATE_LIMIT_RESET_IN_MINUTES - minutesPast;
			const delay = minutesRemaining * 60 * 1000;

			await asyncDelay(delay);
		}

		rides.push(ride);
	}

	return rides;
};

const main = async () => {
	const rawJSON = await asyncReadFile(inFile, "utf8");
	const rideIds: number[] = JSON.parse(rawJSON);

	assert.ok(Array.isArray(rideIds), "JSON isn't array of ids");

	const cachedRides: Ride[] = [];

	try {
		const rawJSON = await asyncReadFile(outFile, "utf8");
		const rides: Ride[] = JSON.parse(rawJSON);

		cachedRides.push(...rides);
	} catch (e) {
		if (e.code !== "ENOENT") {
			console.warn("Error importing cache:", e);
		}
	}

	const cachedIdsSet: Set<number> = new Set(cachedRides.map(ride => ride.id));
	const filteredRideIds = rideIds.filter(id => !cachedIdsSet.has(id));
	const rides = await getRidesByIds(filteredRideIds);

	const allRides = [...cachedRides, ...rides];

	rides.forEach(ride => Object.keys(ride).filter(key => key.startsWith("_")).forEach(key => delete ride[key]));

	const ridesJSON = JSON.stringify(allRides, null, "\t");

	await asyncWriteFile(outFile, ridesJSON, "utf8");
};

main()
.catch(err => {
	console.error(err);
});
