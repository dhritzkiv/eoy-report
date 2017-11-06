import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import {quantile, median, mean, max, min, sum, modeFast} from "simple-statistics";
import * as moment from "moment";
import Ride from "./strava-activities";
import {IncrementalMap} from "./utils";

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

const {_: [inFile]} = minimist(process.argv.slice(2));

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

const ridesByDayArray = [...dailyRidesMap.values()].map(({rides}) => rides).sort((a, b) => b.length - a.length);
const dailyRideCounts = [...dailyRideCountsMap.values()];
const dailyRideDistances = [...dailyRideDistancesMap.values()];

const weekdayRides = rides.filter(({start_date_local_date: date}) => !isWeekend(date));
const weekendRides = rides.filter(({start_date_local_date: date}) => isWeekend(date));
const dayValues = rides.map(mapToValue);
const weekdayValues = weekdayRides.map(mapToValue);
const weekendValues = weekendRides.map(mapToValue)

const totalCount = rides.length;
const totalDistance = sum(dailyRideDistances);
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

console.log("\n** Stats **");
console.log("total rides recorded: %d", totalCount);
console.log("manually enterred rides: %d", rides.filter(({manual}) => manual).length);
console.log("average rides per day: %f", totalCount / daysInYear);
console.log("highest number of rides in a day: %d", ridesByDayArray[0].length);
console.log("average number of rides per day: %d", mean(ridesByDayArray.map(({length}) => length)));
console.log("median daily rides (sparse)", median(dailyRideCounts));
console.log("median daily rides", median(dailyRideCounts.filter(count => count)));
console.log("number of days without a ride: %d", dailyRideCounts.filter(count => !count).length);

console.log("total distance: %fkm", sum(dailyRideDistances) / 1000);
console.log("average daily distance (sparse): %fkm", mean(dailyRideDistances) / 1000);
console.log("average daily distance: %fkm", mean(dailyRideDistances.filter(count => count)) / 1000);
console.log("median daily distance (sparse): %fkm", median(dailyRideDistances) / 1000);
console.log("median daily distance: %fkm", median(dailyRideDistances.filter(count => count)) / 1000);

console.log("longest ride: %fkm", max(rides.map(ride => ride.distance)) / 1000);
console.log("longest weekend ride: %fkm", max(weekendRides.map(r => r.distance)) / 1000);
console.log("longest weekday ride: %fkm", max(weekdayRides.map(r => r.distance)) / 1000);
console.log("shortest ride: %fkm", min(rides.map(ride => ride.distance)) / 1000);
console.log("shortest weekend ride: %fkm", min(weekendRides.map(r => r.distance)) / 1000);
console.log("shortest weekday ride: %fkm", min(weekdayRides.map(r => r.distance)) / 1000);
console.log("average ride: %fkm", mean(rides.map(ride => ride.distance)) / 1000);
console.log("average weekend ride: %fkm", mean(weekendRides.map(r => r.distance)) / 1000);
console.log("average weekday ride: %fkm", mean(weekdayRides.map(r => r.distance)) / 1000);

console.log("median ride: %fkm", median(rides.map(ride => ride.distance)) / 1000);
console.log("75th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.75) / 1000);
console.log("90th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.90) / 1000);
console.log("95th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.95) / 1000);
console.log("99th percentile ride length: %fkm", quantile(rides.map(ride => ride.distance), 0.99) / 1000);

const rideDistancesInKilometres = rides.map(ride => ride.distance / 1000);
const numberOfRidesOverXKilometres = (min: number) => rideDistancesInKilometres.filter(d => d > min).length;

console.log("# of rides over 5km: %d", numberOfRidesOverXKilometres(5));
console.log("# of rides over 10km: %d", numberOfRidesOverXKilometres(10));
console.log("# of rides over 25km: %d", numberOfRidesOverXKilometres(25));
console.log("# of rides over 50km: %d", numberOfRidesOverXKilometres(50));
console.log("# of rides over 75km: %d", numberOfRidesOverXKilometres(75));
console.log("# of rides over 100km: %d", numberOfRidesOverXKilometres(100));


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


