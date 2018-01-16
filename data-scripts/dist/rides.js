"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const simple_statistics_1 = require("simple-statistics");
const moment = require("moment");
const strava_activities_1 = require("./strava-activities");
const utils_1 = require("./utils");
const interpolateLineRange = require("line-interpolate-points");
/// <reference path="./haversine.d.ts"/>
const haversine = require("haversine");
const simplify = require("simplify-js");
class NumberArray extends Array {
}
class NumberMap extends Map {
    constructor(entries) {
        super(entries);
    }
}
const TOLERANCE = 0.001;
const filterByGreaterDateOrGreaterIndexPosition = (rideA, rides) => (rideB, index) => {
    /*if (rideB.start_date_local_date) {
        return rideB.start_date_local_date > rideA.start_date_local_date;
    } else {*/
    return index > rides.indexOf(rideA);
    //}
};
const distanceDiffForTwoPaths = (a, b) => a
    .map((aPoint, index) => [aPoint, b[index]])
    .map(([[x1, y1], [x2, y2]], index, array) => {
    //calculate the difference between the points
    let diff = Math.hypot(x1 - x2, y1 - y2);
    //calculate the alpha along the line
    let alpha = index / array.length;
    //alpha is lower towards the ends of the line
    alpha = Math.min(alpha, 1 - alpha);
    return diff * (2 + alpha);
})
    .reduce((total, distance) => total + distance, 0);
const isWeekend = (date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
//const addValues = (a: number, b: number) => a + b;
const mapToValue = (ride) => ride.distance;
const calculateStreaksForData = (data) => {
    let streakDays = 0;
    let streakRides = 0;
    let drySpell = 0;
    let maxStreakDays = 0;
    let maxStreakRides = 0;
    let maxDrySpell = 0;
    data
        .forEach(value => {
        if (value !== 0) {
            drySpell = 0;
            streakDays++;
            streakRides += value;
        }
        else {
            drySpell++;
            streakDays = 0;
            streakRides = 0;
        }
        maxStreakDays = Math.max(maxStreakDays, streakDays);
        maxStreakRides = Math.max(maxStreakRides, streakRides);
        maxDrySpell = Math.max(maxDrySpell, drySpell);
    });
    return {
        maxStreakDays,
        maxStreakRides,
        maxDrySpell
    };
};
const { _: [inFile, outFile] } = minimist(process.argv.slice(2));
assert.ok(inFile, "Missing input file argument");
const raw = fs.readFileSync(inFile, "utf8");
const data = JSON.parse(raw);
assert.ok(Array.isArray(data), "Data is not an array");
const rides = data.map(d => new strava_activities_1.Ride(d));
rides.sort(({ start_date_local_date: a }, { start_date_local_date: b }) => Number(a) - Number(b));
const startYear = rides[0].start_date_local_date.getFullYear();
const endYear = rides[rides.length - 1].start_date_local_date.getFullYear() + 1;
const startTime = moment(rides[0].start_date_local_date).startOf("year").toDate();
const endTime = moment(rides[rides.length - 1].start_date_local_date).endOf("year").toDate();
const daysInYear = moment(endTime).diff(moment(startTime), "days");
const dailyRidesMap = new Map();
const dailyRideCountsMap = new utils_1.IncrementalMap();
const dailyRideDistancesMap = new utils_1.IncrementalMap();
for (let i = 1; i <= daysInYear; i++) {
    if (moment(startTime).dayOfYear(i).isAfter(new Date())) {
        break;
    }
    dailyRideCountsMap.set(i, 0);
    dailyRideDistancesMap.set(i, 0);
}
rides.forEach(ride => {
    const dayOfYear = moment(ride.start_date_local_date).dayOfYear();
    const rideDay = dailyRidesMap.get(dayOfYear) || {
        date: moment(ride.start_date_local_date).startOf("day").toDate(),
        rides: []
    };
    rideDay.rides.push(ride);
    dailyRideCountsMap.increment(dayOfYear);
    dailyRideDistancesMap.increment(dayOfYear, ride.distance);
    dailyRidesMap.set(dayOfYear, rideDay);
});
const ridesByDayArray = [...dailyRidesMap.values()].map(({ rides }) => rides).sort(({ length: a }, { length: b }) => b - a);
const dailyRideCounts = [...dailyRideCountsMap.values()].sort((a, b) => b - a);
const dailyRideCountsDense = dailyRideCounts.filter(d => d);
const dailyRideDistances = [...dailyRideDistancesMap.values()].sort((a, b) => b - a);
const dailyRideDistancesDense = dailyRideDistances.filter(d => d);
const weekdayRides = rides.filter(({ start_date_local_date: date }) => !isWeekend(date));
const weekendRides = rides.filter(({ start_date_local_date: date }) => isWeekend(date));
const dayValues = rides.map(mapToValue);
const weekdayValues = weekdayRides.map(mapToValue);
const weekendValues = weekendRides.map(mapToValue);
const ridesWithMaps = rides.filter(({ map }) => map);
console.time("find dupes");
ridesWithMaps.forEach(ride => ride.mapline_interop = simplify(ride.mapline.map(([x, y]) => ({ x, y })), TOLERANCE, true).map(({ x, y }) => [x, y]));
//find a median point count for use in interpolation
const medianPointCount = simple_statistics_1.median(ridesWithMaps.map(ride => ride.mapline_interop.length));
//interpolate maps to use same # of points
ridesWithMaps.forEach((ride) => ride.mapline_interop = interpolateLineRange(ride.mapline_interop, medianPointCount));
const dupesMap = new Map();
//finds related rides
ridesWithMaps
    .map(ride => ({
    ride,
    diff: Math.abs(medianPointCount - ride.mapline_interop.length)
}))
    .sort(({ diff: a }, { diff: b }) => a - b)
    .map(({ ride }) => ride)
    .forEach((rideA, i, rides) => {
    const { mapline_interop: pathA } = rideA;
    const pathAReversed = pathA.slice(0).reverse();
    const dupeMapASet = dupesMap.get(rideA) || new Set();
    dupesMap.set(rideA, dupeMapASet);
    rides
        .filter(rideB => rideA !== rideB)
        .filter((rideB, index) => index > rides.indexOf(rideA))
        .forEach(rideB => {
        const { mapline_interop: pathB } = rideB;
        const dupeMapBSet = dupesMap.get(rideB) || new Set();
        dupesMap.set(rideB, dupeMapBSet);
        const distanceDiffs = [pathA, pathAReversed]
            .map(path => distanceDiffForTwoPaths(path, pathB))
            .map(diff => diff / medianPointCount);
        if (Math.min(...distanceDiffs) <= TOLERANCE) {
            dupeMapASet.add(rideB);
            dupeMapBSet.add(rideA);
        }
    });
});
console.timeEnd("find dupes");
console.time("prune dupes");
console.log("rides before de-duping", dupesMap.size);
for (const [parentRide, parentRelatedRides] of dupesMap) {
    const recursiveMergeAndDeleteRelatedRide = (relatedRides) => {
        for (const relatedRide of relatedRides) {
            const subrelatedRides = dupesMap.get(relatedRide);
            if (!subrelatedRides) {
                break;
            }
            subrelatedRides.delete(parentRide);
            for (const subrelatedRide of subrelatedRides) {
                parentRelatedRides.add(subrelatedRide);
                for (const _rides of dupesMap.values()) {
                    if (
                    //two sets are the same
                    _rides === relatedRides ||
                        _rides === parentRelatedRides ||
                        _rides === subrelatedRides) {
                        continue;
                    }
                    _rides.delete(subrelatedRide);
                    _rides.delete(relatedRide);
                    _rides.delete(parentRide);
                }
                recursiveMergeAndDeleteRelatedRide(subrelatedRides);
            }
            ;
            //dupesMap.delete(relatedRide);
            dupesMap.delete(relatedRide);
        }
    };
    recursiveMergeAndDeleteRelatedRide(parentRelatedRides);
}
console.log("rides after de-duping", dupesMap.size);
console.timeEnd("prune dupes");
const mostSimilarRides = [...dupesMap.entries()]
    .map(([ride, rides]) => ({ ride, count: rides.size }));
mostSimilarRides.sort(({ count: a }, { count: b }) => b - a);
console.log();
console.group("Top 10 similar rides");
mostSimilarRides.slice(0, 10)
    .map((entry, index) => [index + 1, entry.ride.id, entry.count])
    .forEach(line => console.log("%d: %s (%d)", ...line));
console.groupEnd();
if (outFile) {
    console.log();
    console.group("Output");
    const ridesArray = Array.from(dupesMap.keys()).map((ride) => ({
        id: ride.id,
        //correct the format from [lat, lon] to [lon, lat]
        points: ride.mapline.map(tuple => tuple.reverse())
    }));
    const reducePoints = (total, { points }) => total + points.length;
    const originalPointCount = ridesArray.reduce(reducePoints, 0);
    console.time("simplify rides");
    ridesArray.forEach((ride) => {
        ride.points = simplify(ride.points.map(([x, y]) => ({ x, y })), 0.0001, true).map(({ x, y }) => [x, y]);
    });
    console.timeEnd("simplify rides");
    const finalPointCount = ridesArray.reduce(reducePoints, 0);
    console.log(`simplified from ${originalPointCount} to ${finalPointCount} points`);
    fs.writeFileSync(outFile, JSON.stringify(ridesArray, null, "\t"));
    console.log("outputed file");
    console.groupEnd();
}
console.log();
console.group("Top speeds");
ridesWithMaps.sort(({ max_speed: a }, { max_speed: b }) => b - a)
    .slice(0, 20)
    .forEach((ride, index) => console.log("%d. ride %s top speed: %fkm/h", index + 1, ride.id, ride.max_speed * 3600 / 1000));
console.groupEnd();
const peakDistanceMap = new Map();
ridesWithMaps.forEach(ride => {
    let maxDistance = -Number.MAX_VALUE;
    const startingPoint = ride.mapline[0];
    ride.mapline
        .slice(1)
        .forEach((point) => {
        const distance = haversine(startingPoint, point, {
            format: "[lat,lon]",
            unit: "km"
        });
        if (distance > maxDistance) {
            maxDistance = distance;
        }
    });
    peakDistanceMap.set(ride, maxDistance);
});
const weeksMap = new utils_1.IncrementalMap();
const weeksDistanceMap = new utils_1.IncrementalMap();
const monthsMap = new utils_1.IncrementalMap();
const monthsDistanceMap = new utils_1.IncrementalMap();
const dayOfWeekMap = new utils_1.IncrementalMap();
const dayOfWeekDistanceMap = new utils_1.IncrementalMap();
const dayOfWeekCountMap = new utils_1.IncrementalMap();
rides.forEach(ride => {
    const dayOfWeekKey = moment(ride.start_date_local_date).format("dddd");
    //const dateKey = ride.start_date_local_date.toISOString().slice(0, 10);
    const weekKey = moment(ride.start_date_local_date).format("YYYY-w");
    const monthKey = ride.start_date_local_date.getMonth();
    dayOfWeekMap.increment(dayOfWeekKey);
    dayOfWeekDistanceMap.increment(dayOfWeekKey, ride.distance);
    weeksMap.increment(weekKey);
    weeksDistanceMap.increment(weekKey, ride.distance);
    monthsMap.increment(monthKey);
    monthsDistanceMap.increment(monthKey, ride.distance);
});
for (let i = 0; i < daysInYear; i++) {
    const day = moment(startTime).add(i, "days");
    const dayOfWeekKey = day.format("dddd");
    dayOfWeekCountMap.increment(dayOfWeekKey);
}
console.log();
console.group("Average rides per day of week");
[...dayOfWeekMap]
    .map(([day, count]) => [day, count / (dayOfWeekCountMap.get(day) || 1)])
    .sort(([, a], [, b]) => b - a)
    .forEach(([day, average]) => console.log(`${day}: ${average}`));
console.groupEnd();
console.log();
console.group("Average ride distance per day of week");
[...dayOfWeekDistanceMap]
    .map(([day, count]) => [day, count / (dayOfWeekCountMap.get(day) || 1)])
    .sort(([, a], [, b]) => b - a)
    .forEach(([day, average]) => console.log(`${day}: ${average / 1000}km`));
console.groupEnd();
console.log();
console.log("Rides by week:", [...weeksMap.values()]);
console.log("Distance by week:", [...weeksDistanceMap.values()].map(d => d / 1000));
console.log();
console.group("Rides by month");
[...monthsMap].forEach(([month, value]) => console.log(`${month}: ${value}`));
console.groupEnd();
console.group("Distance by month");
[...monthsDistanceMap].forEach(([month, value]) => console.log(`${month}: ${value / 1000}km`));
console.groupEnd();
console.log();
console.group("Top 10 rides by distance from start");
[...peakDistanceMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([ride, distance], index) => console.log("%d. ride %s peak distance from start: %fkm", index + 1, ride.id, distance));
console.groupEnd();
const { maxStreakDays: totalMaxStreakDays, maxStreakRides: totalMaxStreakRides, maxDrySpell: totalMaxDrySpell } = calculateStreaksForData([...dailyRideCountsMap.values()]);
console.log();
console.group("Basic stats by rides");
console.log("total rides recorded: %d", rides.length);
console.log("manually enterred rides: %d", rides.filter(({ manual }) => manual).length);
console.log("mean daily rides", simple_statistics_1.mean(dailyRideCounts));
console.log("mean daily rides (dense)", simple_statistics_1.mean(dailyRideCountsDense));
console.log("median daily rides", simple_statistics_1.median(dailyRideCounts));
console.log("median daily rides (dense)", simple_statistics_1.median(dailyRideCountsDense));
console.log("total distance: %fkm", simple_statistics_1.sum(dailyRideDistancesDense) / 1000);
console.log("average daily distance (sparse): %fkm", simple_statistics_1.mean(dailyRideDistances) / 1000);
console.log("average daily distance: %fkm", simple_statistics_1.mean(dailyRideDistancesDense) / 1000);
console.log("total elevation gain: %fm", simple_statistics_1.sum(ridesWithMaps.map(ride => ride.total_elevation_gain)));
console.groupEnd();
console.log();
console.group("Basic stats by days");
console.log("most number of rides in a day: %d", ridesByDayArray[0].length);
console.log("number of days without a ride: %d", dailyRideCounts.filter(count => !count).length);
console.log("most distance in one day: %fkm", dailyRideDistances[0] / 1000);
console.log("least distance in one day (dense): %fkm", dailyRideDistancesDense.slice(-1).map(d => d / 1000)[0]);
const modeDailyRides = simple_statistics_1.modeFast(dailyRideCountsDense);
console.log("mode rides by day: %d", modeDailyRides);
console.log("days with more rides than usual: %d", dailyRideCounts.filter(count => count > modeDailyRides).length);
console.groupEnd();
console.log();
console.group("Streaks");
console.log("Most consectutive days with rides: %d", totalMaxStreakDays);
console.log("Most consectutive rides without a break day: %d", totalMaxStreakRides);
console.log("Longest no-ride streak in days: %d", totalMaxDrySpell);
console.groupEnd();
console.log();
console.group("Ride stats limits");
console.log("longest ride: %fkm", simple_statistics_1.max(rides.map(ride => ride.distance)) / 1000);
console.log("longest weekend ride: %fkm", simple_statistics_1.max(weekendRides.map(r => r.distance)) / 1000);
console.log("longest weekday ride: %fkm", simple_statistics_1.max(weekdayRides.map(r => r.distance)) / 1000);
console.log("shortest ride: %fkm", simple_statistics_1.min(rides.map(ride => ride.distance)) / 1000);
console.log("shortest weekend ride: %fkm", simple_statistics_1.min(weekendRides.map(r => r.distance)) / 1000);
console.log("shortest weekday ride: %fkm", simple_statistics_1.min(weekdayRides.map(r => r.distance)) / 1000);
console.groupEnd();
console.log();
console.group("Days by percentile");
console.log("median daily distance: %fkm", simple_statistics_1.median(dailyRideDistances) / 1000);
console.log("median daily distance (dense): %fkm", simple_statistics_1.median(dailyRideDistancesDense) / 1000);
console.log("75th percentile daily distance: %fkm", simple_statistics_1.quantile(dailyRideDistances, 0.75) / 1000);
console.log("75th percentile daily distance (dense): %fkm", simple_statistics_1.quantile(dailyRideDistancesDense, 0.75) / 1000);
console.log("90th percentile daily distance: %fkm", simple_statistics_1.quantile(dailyRideDistances, 0.90) / 1000);
console.log("90th percentile daily distance (dense): %fkm", simple_statistics_1.quantile(dailyRideDistancesDense, 0.90) / 1000);
console.log("95th percentile daily distance: %fkm", simple_statistics_1.quantile(dailyRideDistances, 0.95) / 1000);
console.log("95th percentile daily distance (dense): %fkm", simple_statistics_1.quantile(dailyRideDistancesDense, 0.95) / 1000);
console.log("99th percentile daily distance: %fkm", simple_statistics_1.quantile(dailyRideDistances, 0.99) / 1000);
console.log("99th percentile daily distance (dense): %fkm", simple_statistics_1.quantile(dailyRideDistancesDense, 0.99) / 1000);
console.groupEnd();
console.log();
console.group("Rides by percentile");
console.log("median ride: %fkm", simple_statistics_1.median(rides.map(ride => ride.distance)) / 1000);
console.log("75th percentile ride length: %fkm", simple_statistics_1.quantile(rides.map(ride => ride.distance), 0.75) / 1000);
console.log("90th percentile ride length: %fkm", simple_statistics_1.quantile(rides.map(ride => ride.distance), 0.90) / 1000);
console.log("95th percentile ride length: %fkm", simple_statistics_1.quantile(rides.map(ride => ride.distance), 0.95) / 1000);
console.log("99th percentile ride length: %fkm", simple_statistics_1.quantile(rides.map(ride => ride.distance), 0.99) / 1000);
console.groupEnd();
const rideDistancesInKilometres = rides.map(ride => ride.distance / 1000);
const numberOfRidesOverXKilometres = (min) => rideDistancesInKilometres.filter(d => d > min).length;
console.log();
console.group("Rides by distance groups");
console.log("# of rides over 5km: %d", numberOfRidesOverXKilometres(5));
console.log("# of rides over 10km: %d", numberOfRidesOverXKilometres(10));
console.log("# of rides over 25km: %d", numberOfRidesOverXKilometres(25));
console.log("# of rides over 50km: %d", numberOfRidesOverXKilometres(50));
console.log("# of rides over 75km: %d", numberOfRidesOverXKilometres(75));
console.log("# of rides over 100km: %d", numberOfRidesOverXKilometres(100));
console.groupEnd();
const rideDaysInKilometres = dailyRideDistances.map(d => d / 1000);
const numberOfDaysOverXKilometres = (min) => rideDaysInKilometres.filter(d => d > min).length;
console.log();
console.group("Days by distance groups");
console.log("# of days over 5km: %d", numberOfDaysOverXKilometres(5));
console.log("# of days over 10km: %d", numberOfDaysOverXKilometres(10));
console.log("# of days over 25km: %d", numberOfDaysOverXKilometres(25));
console.log("# of days over 50km: %d", numberOfDaysOverXKilometres(50));
console.log("# of days over 75km: %d", numberOfDaysOverXKilometres(75));
console.log("# of days over 100km: %d", numberOfDaysOverXKilometres(100));
console.log("Highest average speed: %fkm/h", simple_statistics_1.max(rides.map(({ average_speed }) => average_speed * 3600 / 1000)));
console.log("Lowest average speed: %fkm/h", simple_statistics_1.min(rides.map(({ average_speed }) => average_speed * 3600 / 1000)));
console.log("Median average speed: %fkm/h", simple_statistics_1.median(rides.map(({ average_speed }) => average_speed * 3600 / 1000)));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlkZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsaUNBQWlDO0FBRWpDLHFDQUFxQztBQUNyQyx5REFBNkc7QUFDN0csaUNBQWlDO0FBQ2pDLDJEQUF5QztBQUN6QyxtQ0FBdUM7QUFHdkMsZ0VBQWdFO0FBQ2hFLHdDQUF3QztBQUN4Qyx1Q0FBdUM7QUFDdkMsd0NBQXVDO0FBVXZDLGlCQUFrQixTQUFRLEtBQWE7Q0FBRztBQUkxQyxlQUFnQixTQUFRLEdBQW1CO0lBQzFDLFlBQVksT0FBdUI7UUFDbEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hCLENBQUM7Q0FDRDtBQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQztBQUV4QixNQUFNLHlDQUF5QyxHQUFHLENBQUMsS0FBVyxFQUFFLEtBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFXLEVBQUUsS0FBYSxFQUFFLEVBQUU7SUFDaEg7O2NBRVU7SUFDVCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsR0FBRztBQUNKLENBQUMsQ0FBQztBQUVGLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxDQUF5QixFQUFFLENBQXlCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDMUYsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDMUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM3Qyw2Q0FBNkM7SUFDN0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUss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LG1DQUFtQyxFQUFFLDRCQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMxRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFbkIsTUFBTSx5QkFBeUIsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMxRSxNQUFNLDRCQUE0QixHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBRTVHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1RSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFbkIsTUFBTSxvQkFBb0IsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDbkUsTUFBTSwyQkFBMkIsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUV0RyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsMkJBQTJCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN4RSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLDJCQUEyQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSwyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsMkJBQTJCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN4RSxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSx1QkFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxFQUFFLEVBQUUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLHVCQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsYUFBYSxFQUFDLEVBQUUsRUFBRSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlHLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsMEJBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxhQUFhLEVBQUMsRUFBRSxFQUFFLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMifQ==