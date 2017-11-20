"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const util_1 = require("util");
const strava = require("strava-v3");
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
const { _: [outFile], c: configPath = "../../data/strava_config.json", year = (new Date().getFullYear()) } = args;
assert.ok(outFile, "Missing output file argument");
const stravaConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, configPath), "utf8"));
const asyncListActivities = util_1.promisify(strava.athlete.listActivities.bind(strava.athlete));
const asyncWriteFile = util_1.promisify(fs.writeFile);
const targetRideKeys = ["id", "name", "distance", "moving_time", "elapsed_time", "total_elevation_gain", "start_date_local", "average_speed", "max_speed", "calories"];
const padRec = (value, paddingNumber, length) => value.length >= length ? value : padRec(`${paddingNumber}${value}`, paddingNumber, length);
const getRideIdsForYear = async (year) => {
    const ride_ids = [];
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    const testForYear = (ride) => (ride.start_date_local > startOfYear &&
        ride.start_date_local < endOfYear);
    let outOfBounds = false;
    let retrievalPage = 1;
    while (!outOfBounds) {
        let ridesRaw;
        try {
            ridesRaw = await asyncListActivities({
                page: retrievalPage,
                per_page: 200,
                access_token: stravaConfig.access_token
            });
        }
        catch (e) {
            if (!(e instanceof Error)) {
                throw new Error(e.message);
            }
            throw e;
        }
        const rides = ridesRaw
            .map(({ id, name, distance, moving_time, elapsed_time, total_elevation_gain, start_date_local, average_speed, max_speed, calories }) => {
            const ride = {
                id,
                start_date_local: new Date(start_date_local),
                name,
                distance,
                moving_time,
                elapsed_time,
                total_elevation_gain,
                average_speed,
                max_speed,
                calories
            };
            return ride;
        })
            .filter(testForYear);
        const ids = rides.map(({ id }) => id);
        ride_ids.push(...ids);
        console.log("page %d; retrieved %d rides.", retrievalPage, ids.length);
        retrievalPage++;
        const lastRide = rides[rides.length - 1];
        outOfBounds = !(lastRide && testForYear(lastRide)) || rides.length < 200;
    }
    const data = JSON.stringify(ride_ids, null, "\t");
    await asyncWriteFile(outFile, data);
};
getRideIdsForYear(year)
    .catch(err => {
    throw err;
});
//# sourceMappingURL=get-strava-ride-ids.js.map