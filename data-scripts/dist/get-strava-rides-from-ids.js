"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const util_1 = require("util");
const strava = require("strava-v3");
const minimist = require("minimist");
const strava_activities_1 = require("./strava-activities");
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
    const ride = new strava_activities_1.default(rideData);
});
const getRidesByIds = async (rideIds) => {
    const rides = [];
    for (const id of rideIds) {
        const [rideResponse, limits] = await asyncGetActivity({
            id,
            access_token: stravaConfig.access_token
        });
        const ride = new strava_activities_1.default(rideResponse);
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