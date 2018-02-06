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
        if (entries) {
            super(entries);
        }
        else {
            super();
        }
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
const ridesWithMaps = data.filter(({ map }) => map).map(d => new strava_activities_1.RideWithMap(d));
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
const rideWeeksInKilometres = [...weeksDistanceMap.values()].map(d => d / 1000);
const numberOfWeeksOverXKilometres = (min) => rideWeeksInKilometres.filter(d => d > min).length;
console.log();
console.group("Lengths of time by distance groups");
console.log("# of days over 5km: %d", numberOfDaysOverXKilometres(5));
console.log("# of days over 10km: %d", numberOfDaysOverXKilometres(10));
console.log("# of days over 25km: %d", numberOfDaysOverXKilometres(25));
console.log("# of days over 50km: %d", numberOfDaysOverXKilometres(50));
console.log("# of days over 75km: %d", numberOfDaysOverXKilometres(75));
console.log("# of days over 100km: %d", numberOfDaysOverXKilometres(100));
console.log("# of weeks over 100km: %d", numberOfWeeksOverXKilometres(100));
console.log("# of weeks over 150km: %d", numberOfWeeksOverXKilometres(150));
console.log("# of weeks over 200km: %d", numberOfWeeksOverXKilometres(200));
console.groupEnd();
console.log("Highest average speed: %fkm/h", simple_statistics_1.max(rides.map(({ average_speed }) => average_speed * 3600 / 1000)));
console.log("Lowest average speed: %fkm/h", simple_statistics_1.min(rides.map(({ average_speed }) => average_speed * 3600 / 1000)));
console.log("Median average speed: %fkm/h", simple_statistics_1.median(rides.map(({ average_speed }) => average_speed * 3600 / 1000)));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlkZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsaUNBQWlDO0FBRWpDLHFDQUFxQztBQUNyQyx5REFBNkc7QUFDN0csaUNBQWlDO0FBQ2pDLDJEQUFzRDtBQUN0RCxtQ0FBdUM7QUFHdkMsZ0VBQWdFO0FBQ2hFLHdDQUF3QztBQUN4Qyx1Q0FBdUM7QUFDdkMsd0NBQXVDO0FBU3ZDLGlCQUFrQixTQUFRLEtBQWE7Q0FBRztBQUkxQyxlQUFnQixTQUFRLEdBQW1CO0lBQzFDLFlBQVksT0FBb0M7UUFDL0MsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNiLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxLQUFLLEVBQUUsQ0FBQztRQUNULENBQUM7SUFDRixDQUFDO0NBQ0Q7QUFFRCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFFeEIsTUFBTSx5Q0FBeUMsR0FBRyxDQUFDLEtBQVcsRUFBRSxLQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBVyxFQUFFLEtBQWEsRUFBRSxFQUFFO0lBQ2hIOztjQUVVO0lBQ1QsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLEdBQUc7QUFDSixDQUFDLENBQUM7QUFFRixNQUFNLHVCQUF1QixHQUFHLENBQUMsQ0FBeUIsRUFBRSxDQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzFGLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzFDLEdBQUcsQ0FBQyxDQUFDLENBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFF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