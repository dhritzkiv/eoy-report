"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const util_1 = require("util");
const strava = require("strava-v3");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
const { _: [inFile, outFile], c: configPath = "../../data/strava_config.json" } = args;
assert.ok(inFile, "Missing input file argument");
assert.ok(outFile, "Missing output file argument");
const stravaConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, configPath), "utf8"));
const RATE_LIMIT_RESET_IN_MINUTES = 15;
const asyncDelay = util_1.promisify(setTimeout);
class CustomError extends Error {
}
const asyncGetActivity = (arg) => new Promise((resolve, reject) => {
    strava.activities.get(arg, (err, ride, limits) => {
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
var ActivityType;
(function (ActivityType) {
    ActivityType["ride"] = "ride";
    ActivityType["run"] = "run";
    ActivityType["swim"] = "swim";
})(ActivityType || (ActivityType = {}));
;
/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
function enumerable(value) {
    return function (target, propertyKey) {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (descriptor.enumerable != value) {
            descriptor.enumerable = value;
            Object.defineProperty(target, propertyKey, descriptor);
        }
    };
}
class Ride {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.distance = data.distance; //meter
        this.moving_time = data.moving_time; //second
        this.elapsed_time = data.elapsed_time; //second
        this.manual = data.manual;
        this.type = data.type;
        this.start_date = data.start_date;
        this.start_date_local = data.start_date_local;
        this.gear_id = data.gear_id;
        //this.private = data.private;
        this.average_speed = data.average_speed; //meters per secon
        if (!this.manual) {
            this.total_elevation_gain = data.total_elevation_gain; //meter
            this.elev_high = data.elev_high;
            this.elev_low = data.elev_low;
            this.timezone = data.timezone;
            this.start_latlng = data.start_latlng;
            this.end_latlng = data.end_latlng;
            this.map = data.map;
            this.max_speed = data.max_speed; //meters per seco
            this.average_watts = data.average_watts;
            this.kilojoules = data.kilojoules;
            this.calories = data.calories;
        }
        this._start_date_date = new Date(this.start_date);
        this._start_date_local_date = new Date(this.start_date_local);
    }
    get start_date_date() {
        return this._start_date_date;
    }
    get start_date_local_date() {
        return this._start_date_local_date;
    }
}
__decorate([
    enumerable(false)
], Ride.prototype, "start_date_date", null);
__decorate([
    enumerable(false)
], Ride.prototype, "start_date_local_date", null);
const padRec = (value, paddingNumber, length) => value.length >= length ? value : padRec(`${paddingNumber}${value}`, paddingNumber, length);
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
const asyncReadFile = util_1.promisify(fs.readFile);
const asyncWriteFile = util_1.promisify(fs.writeFile);
const getRideById = async (id) => strava.activities.get({ id }, (err, rideData) => {
    if (err) {
        throw err;
    }
    if (rideData.errors) {
        throw new Error(rideData.message);
    }
    const ride = new Ride(rideData);
});
const getRidesByIds = async (rideIds) => {
    const rides = [];
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
    const rideIds = JSON.parse(rawJSON);
    assert.ok(Array.isArray(rideIds), "JSON isn't array of ids");
    const cachedRides = [];
    try {
        const rawJSON = await asyncReadFile(outFile, "utf8");
        const rides = JSON.parse(rawJSON);
        cachedRides.push(...rides);
    }
    catch (e) {
        if (e.code !== "ENOENT") {
            console.warn("Error importing cache:", e);
        }
    }
    const cachedIdsSet = new Set(cachedRides.map(ride => ride.id));
    const filteredRideIds = rideIds.filter(id => !cachedIdsSet.has(id));
    const rides = await getRidesByIds(filteredRideIds);
    const allRides = [...cachedRides, ...rides];
    const ridesJSON = JSON.stringify(allRides, null, "\t");
    await asyncWriteFile(outFile, ridesJSON, "utf8");
};
main()
    .catch(err => {
    console.error(err);
});
//# sourceMappingURL=get-strava-rides-from-ids.js.map