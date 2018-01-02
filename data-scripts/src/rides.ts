import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import {quantile, median, mean, max, min, sum, modeFast as mode, standardDeviation} from "simple-statistics";
import * as moment from "moment";
import {Ride} from "./strava-activities";
import {IncrementalMap} from "./utils";
/// <reference path="./polyline.d.ts" name="@mapbox/polyline"/>
import * as polyline from "@mapbox/polyline";
import * as interpolateLineRange from "line-interpolate-points";
/// <reference path="./haversine.d.ts"/>
import * as haversine from "haversine";
import * as simplify from "simplify-js"

interface RideDay {
	date: Date;
	rides: Ride[];
}

type RideDays = RideDay[];

class NumberArray extends Array<number> {}

interface NumberTuple extends NumberArray { 0: number; 1: number; }

class NumberMap extends Map<number, number> {
	constructor(entries?: NumberTuple[]) {
		super(entries);
	}
}

const TOLERANCE = 0.001;

const filterByGreaterDateOrGreaterIndexPosition = (rideA: Ride, rides: Ride[]) => (rideB: Ride, index: number) => {
	/*if (rideB.start_date_local_date) {
		return rideB.start_date_local_date > rideA.start_date_local_date;
	} else {*/
		return index > rides.indexOf(rideA);
	//}
};

const distanceDiffForTwoPaths = (a: polyline.LatLonTuple[], b: polyline.LatLonTuple[]) => a
.map((aPoint, index) => [aPoint, b[index]])
.map(([ [x1, y1], [x2, y2] ], index, array) => {
	//calculate the difference between the points
	let diff = Math.hypot(x1 - x2, y1 - y2);

	//calculate the alpha along the line
	let alpha = index / array.length;
	//alpha is lower towards the ends of the line
	alpha = Math.min(alpha, 1 - alpha);

	return diff * (2 + alpha);
})
.reduce((total, distance) => total + distance, 0);

const isWeekend = (date: Date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
//const addValues = (a: number, b: number) => a + b;
const mapToValue = (ride: Ride) => ride.distance;

const calculateStreaksForData = (data: number[]) => {
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
		} else {
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

/**
 * @param data {RideDays} - an array of days
 */
const getRidesByDayOfWeek = (data: RideDays): number[] => {
	//create a new Map for holding values for each day of the week; fill it with empty data
	const days = new IncrementalMap<number>(new NumberArray(7).fill(0).map<NumberTuple>((v: number, i) => [i, v]));

	data
	.map(({date, rides}) => [date.getUTCDay(), sum(rides.map(({distance}) => distance))])
	.map(([date, value]) => [date, value])
	.forEach(([day, value]) => days.increment(day, value));

	return [...days.values()];
};

const {_: [inFile, outFile]} = minimist(process.argv.slice(2));

assert.ok(inFile, "Missing input file argument");

const raw = fs.readFileSync(inFile, "utf8");
const data: Ride[] = JSON.parse(raw);

assert.ok(Array.isArray(data), "Data is not an array");

const rides = data.map(d => new Ride(d));

rides.sort(({start_date_local_date: a}, {start_date_local_date: b}) => Number(a) - Number(b));

const startYear = rides[0].start_date_local_date.getFullYear();
const endYear = rides[rides.length - 1].start_date_local_date.getFullYear() + 1;
const startTime = moment(rides[0].start_date_local_date).startOf("year").toDate();
const endTime = moment(rides[rides.length - 1].start_date_local_date).endOf("year").toDate();
const daysInYear = moment(endTime).diff(moment(startTime), "days");

const dailyRidesMap = new Map<number, RideDay>();
const dailyRideCountsMap = new IncrementalMap<number>();
const dailyRideDistancesMap = new IncrementalMap<number>();

for (let i = 1; i < daysInYear; i++) {
	if (moment(startTime).dayOfYear(i).isAfter(new Date())) {
		break;
	}

	dailyRideCountsMap.set(i, 0);
	dailyRideDistancesMap.set(i, 0);
}

rides.forEach(ride => {
	const dayOfYear = moment(ride.start_date_local_date).dayOfYear();
	const rideDay: RideDay = dailyRidesMap.get(dayOfYear) || {
		date: moment(ride.start_date_local_date).startOf("day").toDate(),
		rides: []
	};

	rideDay.rides.push(ride);

	dailyRideCountsMap.increment(dayOfYear);
	dailyRideDistancesMap.increment(dayOfYear, ride.distance);
	dailyRidesMap.set(dayOfYear, rideDay);
});

const ridesByDayArray = [...dailyRidesMap.values()].map(({rides}) => rides).sort(({length: a}, {length: b}) => b - a);
const dailyRideCounts = [...dailyRideCountsMap.values()].sort((a, b) => b - a);
const dailyRideCountsDense = dailyRideCounts.filter(d => d);
const dailyRideDistances = [...dailyRideDistancesMap.values()].sort((a, b) => b - a);
const dailyRideDistancesDense = dailyRideDistances.filter(d => d);

const weekdayRides = rides.filter(({start_date_local_date: date}) => !isWeekend(date));
const weekendRides = rides.filter(({start_date_local_date: date}) => isWeekend(date));
const dayValues = rides.map(mapToValue);
const weekdayValues = weekdayRides.map(mapToValue);
const weekendValues = weekendRides.map(mapToValue);
const ridesWithMaps = rides.filter(({map}) => map);

/*let maxStreakDays = 0;
let maxStreakRides = 0;
let maxDryStreak = 0;
for (const dayRideCount of dailyRideCounts) {

}*/

console.time("find dupes");

ridesWithMaps.forEach(ride => ride.mapline_interop = simplify(
	ride.mapline.map(([x, y]) => ({x, y})),
	TOLERANCE,
	true
).map(({x, y}) => [x, y]))

//find a median point count for use in interpolation
const medianPointCount = median(ridesWithMaps.map(ride => ride.mapline_interop.length));

//interpolate maps to use same # of points
ridesWithMaps.forEach((ride) => ride.mapline_interop = interpolateLineRange(ride.mapline_interop, medianPointCount));

const dupesMap = new Map<Ride, Set<Ride>>();

//finds related rides
ridesWithMaps
.map(ride => ({
	ride,
	diff: Math.abs(medianPointCount - ride.mapline_interop.length)
}))
.sort(({diff: a}, {diff: b}) => a - b)
.map(({ride}) => ride)
.forEach((rideA, i, rides) => {
	const {mapline_interop: pathA} = rideA;
	const pathAReversed = pathA.slice(0).reverse();
	const dupeMapASet = dupesMap.get(rideA) || new Set();

	dupesMap.set(rideA, dupeMapASet);

	rides
	//rideB isn't rideA
	.filter(rideB => rideA !== rideB)
	//pathB hasn't already been marked a dupe
	//.filter(rideB => !dupesSet.has(rideB))
	//pathB comes after pathA
	.filter((rideB, index) => index > rides.indexOf(rideA))
	.forEach(rideB => {
		const {mapline_interop: pathB} = rideB;
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

	const recursiveMergeAndDeleteRelatedRide = (relatedRides: Set<Ride>) => {
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
						_rides === subrelatedRides
					) {
						continue;
					}

					_rides.delete(subrelatedRide);
					_rides.delete(relatedRide);
					_rides.delete(parentRide);
				}

				recursiveMergeAndDeleteRelatedRide(subrelatedRides);
			};

			//dupesMap.delete(relatedRide);

			dupesMap.delete(relatedRide);
		}
	};

	recursiveMergeAndDeleteRelatedRide(parentRelatedRides);
}

console.log("rides after de-duping", dupesMap.size);

console.timeEnd("prune dupes");

const mostSimilarRides = [...dupesMap.entries()]
.map(([ride, rides]) => ({ride, count: rides.size}));

mostSimilarRides.sort(({count: a}, {count: b}) => b - a);

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

	const reducePoints = (total, {points}) => total + points.length;

	const originalPointCount = ridesArray.reduce(reducePoints, 0);

	console.time("simplify rides");

	ridesArray.forEach((ride) => {
		ride.points = simplify(ride.points.map(([x, y]) => ({x, y})), 0.00009, true).map(({x, y}) => [x, y]);
	});

	console.timeEnd("simplify rides");

	const finalPointCount = ridesArray.reduce(reducePoints, 0);

	console.log(`simplified from ${originalPointCount} to ${finalPointCount} points`);

	fs.writeFileSync(outFile, JSON.stringify(ridesArray, null, "\t"));

	console.log("outputed file");
	console.groupEnd();
}

const peakDistanceMap = new Map<Ride, number>();

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

console.log();
console.group("Top 10 rides by distance from start");
[...peakDistanceMap]
.sort(([, a], [, b]) => b - a)
.slice(0, 5)
.forEach(([ride, distance], index) => console.log("%d. ride %s peak distance from start: %fkm", index + 1, ride.id, distance));
console.groupEnd();

const {
	maxStreakDays: totalMaxStreakDays,
	maxStreakRides: totalMaxStreakRides,
	maxDrySpell: totalMaxDrySpell
} = calculateStreaksForData([...dailyRideCountsMap.values()]);

/*const totalCount = sum(dayValues);
const weekdayCount = sum(weekdayValues);
const weekendCount = sum(weekendValues);
const medianCoffees = median(dayValues);
const medianWeekdayCoffees = median(weekdayValues);
const medianWeekendCoffees = median(weekendValues);
const modeCoffees = modeFast(dayValues);
const modeWeekdayCoffees = modeFast(weekdayValues);
const modeWeekendCoffees = modeFast(weekendValues);
const mostCoffees = max(dayValues);
const mostWeekdayCoffees = max(weekdayValues);
const mostWeekendCoffees = max(weekendValues);
const dryDays = data.filter(({value}) => !value);
const dryWeekdays = weekdayDays.filter(({value}) => !value);
const dryWeekends = weekendDays.filter(({value}) => !value);
const moreCoffeeThanUsualDays = data.filter(({value}) => value > modeCoffees);*/

/*const coffeesByDayOfWeekSorted = getRidesByDayOfWeek(data)
.map((value, index): [string, number] => [moment().day(index).format("dddd"), value])
.sort(([, a], [, b]) => b - a);

const dayOfMostCoffees = coffeesByDayOfWeekSorted[0];
const dayOfLeastCoffees = coffeesByDayOfWeekSorted[coffeesByDayOfWeekSorted.length - 1];

const {
	maxStreakDays: totalMaxStreakDays,
	maxStreakCoffees: totalMaxStreakCoffees,
	maxDrySpell: totalMaxDrySpell
} = calculateStreaksForData(dayValues);

const {
	maxStreakDays: weekdayMaxStreakDays,
	maxStreakCoffees: weekdayMaxStreakCoffees,
	maxDrySpell: weekdayMaxDrySpell
} = calculateStreaksForData(weekdayValues);

const {
	maxStreakDays: weekendMaxStreakDays,
	maxStreakCoffees: weekendMaxStreakCoffees,
	maxDrySpell: weekendMaxDrySpell
} = calculateStreaksForData(weekendValues);*/

console.group("Basic stats by rides");
console.log("total rides recorded: %d", rides.length);
console.log("manually enterred rides: %d", rides.filter(({manual}) => manual).length);
console.log("mean daily rides", mean(dailyRideCounts));
console.log("mean daily rides (dense)", mean(dailyRideCountsDense));
console.log("median daily rides", median(dailyRideCounts));
console.log("median daily rides (dense)", median(dailyRideCountsDense));
console.log("total distance: %fkm", sum(dailyRideCountsDense) / 1000);
console.log("average daily distance (sparse): %fkm", mean(dailyRideDistances) / 1000);
console.log("average daily distance: %fkm", mean(dailyRideCountsDense) / 1000);
console.groupEnd();

console.log();
console.group("Basic stats by days");
console.log("most number of rides in a day: %d", ridesByDayArray[0].length);
console.log("number of days without a ride: %d", dailyRideCounts.filter(count => !count).length);
console.log("most distance in one day: %fkm", dailyRideDistances[0] / 1000);
console.log("least distance in one day (dense): %fkm", dailyRideDistancesDense.slice(-1).map(d => d / 1000)[0]);
const modeDailyRides = mode(dailyRideCountsDense);

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
console.log("longest ride: %fkm", max(rides.map(ride => ride.distance)) / 1000);
console.log("longest weekend ride: %fkm", max(weekendRides.map(r => r.distance)) / 1000);
console.log("longest weekday ride: %fkm", max(weekdayRides.map(r => r.distance)) / 1000);
console.log("shortest ride: %fkm", min(rides.map(ride => ride.distance)) / 1000);
console.log("shortest weekend ride: %fkm", min(weekendRides.map(r => r.distance)) / 1000);
console.log("shortest weekday ride: %fkm", min(weekdayRides.map(r => r.distance)) / 1000);
console.groupEnd();

console.log();
console.group("Days by percentile");
console.log("median daily distance: %fkm", median(dailyRideDistances) / 1000);
console.log("median daily distance (dense): %fkm", median(dailyRideDistancesDense) / 1000);
console.log("75th percentile daily distance: %fkm", quantile(dailyRideDistances, 0.75) / 1000);
console.log("75th percentile daily distance (dense): %fkm", quantile(dailyRideDistancesDense, 0.75) / 1000);
console.log("90th percentile daily distance: %fkm", quantile(dailyRideDistances, 0.90) / 1000);
console.log("90th percentile daily distance (dense): %fkm", quantile(dailyRideDistancesDense, 0.90) / 1000);
console.log("95th percentile daily distance: %fkm", quantile(dailyRideDistances, 0.95) / 1000);
console.log("95th percentile daily distance (dense): %fkm", quantile(dailyRideDistancesDense, 0.95) / 1000);
console.log("99th percentile daily distance: %fkm", quantile(dailyRideDistances, 0.99) / 1000);
console.log("99th percentile daily distance (dense): %fkm", quantile(dailyRideDistancesDense, 0.99) / 1000);
console.groupEnd();

console.log();
console.group("Rides by percentile");
console.log("median ride: %fkm", median(rides.map(ride => ride.distance)) / 1000);
console.log("75th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.75) / 1000);
console.log("90th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.90) / 1000);
console.log("95th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.95) / 1000);
console.log("99th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.99) / 1000);
console.groupEnd();

const rideDistancesInKilometres = rides.map(ride => ride.distance / 1000);
const numberOfRidesOverXKilometres = (min: number) => rideDistancesInKilometres.filter(d => d > min).length;

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
const numberOfDaysOverXKilometres = (min: number) => rideDaysInKilometres.filter(d => d > min).length;

console.log();
console.group("Days by distance groups");
console.log("# of days over 5km: %d", numberOfDaysOverXKilometres(5));
console.log("# of days over 10km: %d", numberOfDaysOverXKilometres(10));
console.log("# of days over 25km: %d", numberOfDaysOverXKilometres(25));
console.log("# of days over 50km: %d", numberOfDaysOverXKilometres(50));
console.log("# of days over 75km: %d", numberOfDaysOverXKilometres(75));
console.log("# of days over 100km: %d", numberOfDaysOverXKilometres(100));

console.log("Highest average speed: %fkm/h", max(rides.map(({average_speed}) => average_speed * 3600 / 1000)));
console.log("Lowest average speed: %fkm/h", min(rides.map(({average_speed}) => average_speed * 3600 / 1000)));
console.log("Median average speed: %fkm/h", median(rides.map(({average_speed}) => average_speed * 3600 / 1000)));


/*console.log("average", totalCount / data.length);
console.log("average (weekdays)", weekdayCount / weekdayDays.length);
console.log("average (weekends)", weekendCount / weekendDays.length);
console.log("median", medianCoffees);
console.log("median (weekday)", medianWeekdayCoffees);
console.log("median (weekend)", medianWeekendCoffees);
console.log("mode", modeCoffees);
console.log("mode (weekday)", modeWeekdayCoffees);
console.log("mode (weekend)", modeWeekendCoffees);
console.log("most", mostCoffees);
console.log("most (weekday)", mostWeekdayCoffees);
console.log("most (weekend)", mostWeekendCoffees);*/

/*console.log("\n** Totals **");
console.log("total days recorded", data.length);
console.log("weekdays recorded", weekdayDays.length);
console.log("weekend days recorded", weekendDays.length);
console.log("total coffees", totalCount);
console.log("weekday coffees", weekdayCount);
console.log("weekend coffees", weekendCount);
console.log("total days without coffee", dryDays.length);
console.log("total weekdays without coffee", dryWeekdays.length);
console.log("total weekends without coffee", dryWeekends.length);
console.log("total days with more coffee than usual", moreCoffeeThanUsualDays.length);
console.log("day of week with most coffees", dayOfMostCoffees.join(": "));
console.log("day of week with least coffees", dayOfLeastCoffees.join(": "));*/

/*console.log("\n** Streaks **");
console.log("longest streak (days)", totalMaxStreakDays);
console.log("longest streak (coffees)", totalMaxStreakCoffees);
console.log("longest dry spell (days)", totalMaxDrySpell);
console.log("longest weekday streak (days)", weekdayMaxStreakDays);
console.log("longest weekday streak (coffees)", weekdayMaxStreakCoffees);
console.log("longest weekday dry spell (days)", weekdayMaxDrySpell);
console.log("longest weekend streak (days)", weekendMaxStreakDays);
console.log("longest weekend streak (coffees)", weekendMaxStreakCoffees);
console.log("longest weekend dry spell (days)", weekendMaxDrySpell);*/


