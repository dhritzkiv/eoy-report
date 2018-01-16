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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXN0cmF2YS1yaWRlLWlkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9nZXQtc3RyYXZhLXJpZGUtaWRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFDakMsK0JBQStCO0FBQy9CLG9DQUFvQztBQUNwQyxxQ0FBcUM7QUFFckMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxFQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLEdBQUcsK0JBQStCLEVBQUUsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFDLEdBQUcsSUFBSSxDQUFDO0FBRWhILE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLDhCQUE4QixDQUFDLENBQUM7QUFFbkQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFFOUYsTUFBTSxtQkFBbUIsR0FBRyxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMxRixNQUFNLGNBQWMsR0FBRyxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQWUvQyxNQUFNLGNBQWMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsc0JBQXNCLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxVQUFV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