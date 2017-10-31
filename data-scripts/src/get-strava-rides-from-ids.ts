
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import {promisify} from "util";
import * as strava from "strava-v3";
import * as async from "async";
import * as polyline from "polyline";
import * as minimist from "minimist";

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

enum ActivityType {
	ride = "ride",
	run	 = "run",
	swim = "swim"
}

interface LatLon {
	0: number;
	1: number;
}

interface ActivityMap {
	id: string;
    polyline: string;
    summary_polyline: string;
    resource_state: number;
}

interface Activity {
	id:	number;
	name?: string;
	description?: string;
	distance: number;//meters
	moving_time: number;//seconds
	elapsed_time: number;//seconds
	total_elevation_gain: number;//meters
	elev_high: number;
	elev_low: number;
	type: ActivityType;
	start_date:	string | Date;
	start_date_local: string | Date;
	timezone: string;
	start_latlng?: LatLon;
	end_latlng?: LatLon;
	map?: ActivityMap;
	manual:	boolean;
	private: boolean;
	gear_id: string;
	average_speed: number;//meters per second
	max_speed: number;//meters per secod
	average_watts: number;
	kilojoules:	number;
	calories: number;
}

interface Ride extends Activity {};

/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
function enumerable(value: boolean) {
    return function (target: any, propertyKey: string) {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (descriptor.enumerable != value) {
			descriptor.enumerable = value;
            Object.defineProperty(target, propertyKey, descriptor)
        }
    };
}

class Ride implements Ride {
	private _start_date_date: Date;
	private _start_date_local_date: Date;

	constructor(data: RideResponseObject) {
		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
		this.distance = data.distance;//meter
		this.moving_time = data.moving_time;//second
		this.elapsed_time = data.elapsed_time;//second
		this.manual = data.manual;
		this.type = data.type;
		this.start_date = data.start_date;
		this.start_date_local = data.start_date_local;
		this.gear_id = data.gear_id;
		//this.private = data.private;
		this.average_speed = data.average_speed;//meters per secon

		if (!this.manual) {
			this.total_elevation_gain = data.total_elevation_gain;//meter
			this.elev_high = data.elev_high;
			this.elev_low = data.elev_low;
			this.timezone = data.timezone;
			this.start_latlng = data.start_latlng;
			this.end_latlng = data.end_latlng
			this.map = data.map;
			this.max_speed = data.max_speed;//meters per seco
			this.average_watts = data.average_watts;
			this.kilojoules = data.kilojoules;
			this.calories = data.calories;
		}

		this._start_date_date = new Date(this.start_date);
		this._start_date_local_date = new Date(this.start_date_local);
	}

	@enumerable(false)
	get start_date_date() {
		return this._start_date_date;
	}

	@enumerable(false)
	get start_date_local_date() {
		return this._start_date_local_date;
	}
}

const padRec = (value: string, paddingNumber: number, length: number) => value.length >= length ? value : padRec(`${paddingNumber}${value}`, paddingNumber, length);

/*
const simplifyRideData = (ride) => {
	const simple = {};

	targetRideKeys.forEach(key => (simple[key] = ride[key]));

	if (ride.map && ride.map.polyline) {
		simple.points = polyline.decode(ride.map.polyline);
		//reverse order of coords
		simple.points = simple.points.map(point => point.reverse());
	}

	return simple;
};
*/

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

	const ridesJSON = JSON.stringify(allRides, null, "\t");

	await asyncWriteFile(outFile, ridesJSON, "utf8");
};

main()
.catch(err => {
	console.error(err)
});
