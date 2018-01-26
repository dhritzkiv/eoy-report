import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import * as moment from "moment-timezone";
import { IncrementalMap } from "./utils";
import * as csvtojson from "csvtojson";
import { median, mean, min, max, quantile } from "simple-statistics";

interface Sleep {
	start: moment.Moment;
	end: moment.Moment;
	duration: number;
	heart_rate: number | null;
	steps: number;
}

type Sleeps = Sleep[];

class NumberArray extends Array<number> {}

interface NumberTuple extends NumberArray { 0: number; 1: number; }

class NumberMap extends Map<number, number> {
	constructor(entries?: NumberTuple[]) {
		super(entries);
	}
}

const getCSVasJS = (string: string) => new Promise<any[]>((resolve, reject) => {
	const data: any[] = [];

	csvtojson({
		delimiter: ";"
	})
	.fromString(string)
	.on("json", (json: any) => data.push(json))
	.on('done', (err) => {
		if (err) {
			return reject(err);
		}

		resolve(data);
	});
});

const isWeekend = (date: Date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;

const calculateStreaksForData = (data: number[]) => {
	let streakDays = 0;
	let streakActivities = 0;
	let drySpell = 0;
	let maxStreakDays = 0;
	let maxStreakActivities = 0;
	let maxDrySpell = 0;

	data
	.forEach(value => {
		if (value !== 0) {
			drySpell = 0;
			streakDays++;
			streakActivities += value;
		} else {
			drySpell++;
			streakDays = 0;
			streakActivities = 0;
		}

		maxStreakDays = Math.max(maxStreakDays, streakDays);
		maxStreakActivities = Math.max(maxStreakActivities, streakActivities);
		maxDrySpell = Math.max(maxDrySpell, drySpell);
	});

	return {
		maxStreakDays,
		maxStreakActivities,
		maxDrySpell
	};
};

const getValueByDayOfWeek = (data: {date: moment.Moment, value?: number}[]) => {
	//create a new Map for holding values for each day of the week; fill it with empty data
	const days = new IncrementalMap<number>();

	data
	.map(({date, value}) => ({day: date.day(), value: value || 1}))
	.forEach(({day, value}) => days.increment(day, value));

	return [...days];
};

const {_: [inFile]} = minimist(process.argv.slice(2));

assert.ok(inFile, "Missing input file argument");

const raw = fs.readFileSync(inFile, "utf8");

const TZ_TORONTO = "America/Toronto";
const TZ_SHANGHAI = "Asia/Shanghai";
const TZ_SYDNEY = "Australia/Sydney";
const TZ_MELBOURNE = "Australia/Melbourne";
const TZ_AUCKLAND = "Pacific/Auckland";
const TZ_VANCOUVER = "America/Vancouver";

const main = async () => {
	const data = await getCSVasJS(raw);

	const sleeps: Sleeps = data
	.map((datum) => {
		const startMoment = moment.tz(datum["Start"], TZ_TORONTO);
		const endMoment = moment.tz(datum["End"], TZ_TORONTO);

		let tz = TZ_TORONTO;

		if (
			startMoment.isBetween(
				moment.tz("2017-02-05", TZ_SHANGHAI),
				moment.tz("2017-02-05", TZ_SHANGHAI).endOf("day")
			) ||
			startMoment.isBetween(
				moment.tz("2017-03-05", TZ_SHANGHAI),
				moment.tz("2017-03-05", TZ_SHANGHAI).endOf("day")
			)
		) {
			tz = TZ_SHANGHAI;
		} else if (
			startMoment.isBetween(
				moment.tz("2017-02-06", TZ_SYDNEY),
				moment.tz("2017-02-15", TZ_SYDNEY).add(12, "h")
			)
		) {
			tz = TZ_SYDNEY;
		} else if (
			startMoment.isBetween(
				moment.tz("2017-02-15", TZ_MELBOURNE).add(12, "h"),
				moment.tz("2017-02-21", TZ_MELBOURNE).add(12, "h")
			)
		) {
			tz = TZ_MELBOURNE;
		} else if (
			startMoment.isBetween(
				moment.tz("2017-02-21", TZ_AUCKLAND).add(12, "h"),
				moment.tz("2017-03-04", TZ_AUCKLAND).endOf("day")
			)
		) {
			tz = TZ_AUCKLAND;
		} else if (
			startMoment.isBetween(
				moment.tz("2017-09-21", TZ_VANCOUVER).add(6, "h"),
				moment.tz("2017-09-26", TZ_VANCOUVER).endOf("day")
			)
		) {
			tz = TZ_VANCOUVER;
		}

		const start = startMoment.clone().tz(tz);
		const end = endMoment.clone().tz(tz);

		const sleep: Sleep = {
			start,
			end,
			duration: moment.duration(datum["Time in bed"]).asHours(),
			heart_rate: parseInt(datum["Heart rate"], 10) || null,
			steps: datum["Steps"]
		};

		return sleep;
	})
	.filter(({duration}) => duration)
	.sort(({start: a}, {start: b}) => Number(a) - Number(b));

	const startTime = moment(sleeps[0].start).startOf("day").startOf("year");
	const endTime = moment(sleeps[sleeps.length - 1].start).startOf("day").endOf("year");
	const daysInYear = 365;//endTime.diff(moment(startTime), "days");

	const dayOfWeekCountMap = new IncrementalMap<string>();
	const monthCountMap = new IncrementalMap<string>();
	const monthDurationMap = new IncrementalMap<string>();

	/*for (let i = 0; i < daysInYear; i++) {
		const day = moment(startTime).add(i, "days");
		const dayOfWeekKey = day.format("dddd");
	}*/

	sleeps.forEach(({start, duration}) => {
		const dayOfWeekKey = start.format("dddd");
		const monthKey = moment(start).format("MMMM");

		dayOfWeekCountMap.increment(dayOfWeekKey);
		monthCountMap.increment(monthKey);
		monthDurationMap.increment(monthKey, duration);
	});

	const sleepsByDayOfWeekSorted = getValueByDayOfWeek(sleeps.map(({start}) => ({date: start.clone().subtract(6, "h")})))
	.map(([day, value]): [string, number] => [moment().day(day).format("dddd"), value])
	.sort(([, a], [, b]) => b - a);

	console.log();
	console.group("Sleeps by day of week");
	sleepsByDayOfWeekSorted
	.forEach(([day, val]) => console.log(`${day}: ${val}`));
	console.groupEnd();

	console.log();
	console.group("Average sleeps by day of week");
	sleepsByDayOfWeekSorted
	.map(([day, val]) => [day, val / (dayOfWeekCountMap.get(day) || 1)])
	.forEach(([day, val]) => console.log(`${day}: ${val}`));
	console.groupEnd();

	const durationByDayOfWeekSorted = getValueByDayOfWeek(
		sleeps.map(({start, duration}) => ({
			date: start.hour() < 12 ? start.clone().subtract(1, "d").endOf("day") : start.clone(),
			value: duration
		}))
	)
	.map(([day, value]): [string, number] => [moment().day(day).format("dddd"), value]);

	console.log();
	console.group("Average sleep duration by day of week");
	durationByDayOfWeekSorted
	.map(([day, val]): [string, number] => [day, val / ((dayOfWeekCountMap.get(day) || 1))])
	.sort(([, a], [, b]) => b - a)
	.forEach(([day, val]) => console.log(`${day}: ${val}`));
	console.groupEnd();

	console.log();
	console.group("Sleeps by month");
	[...monthCountMap]
	.forEach(([month, val]) => console.log(`${month}: ${val}`));
	console.groupEnd();

	console.log();
	console.group("Average sleep duration by month");
	[...monthDurationMap]
	.map(([month, val]): [string, number] => [month, (val / (monthCountMap.get(month) || 0))])
	.forEach(([month, val]) => console.log(`${month}: ${val}`));
	console.groupEnd();

	console.log();
	console.group("Sleep duration by month");
	[...monthDurationMap]
	.map(([month, val]): [string, number] => [month, (val / (monthCountMap.get(month) || 0)) * moment(startTime).month(month).daysInMonth()])
	.forEach(([month, val]) => console.log(`${month}: ${val}`));
	console.groupEnd();

	const averageDuration = mean(sleeps.map(({duration}) => duration));

	const medianBedTime = moment()
	.startOf("day")
	.add(median(
		sleeps
		.map(({start}) => start)
		.map(start => start.diff(
			start.clone().startOf("day"),
			"h",
			true
		)
	)), "h");

	const medianWakeTime = moment()
	.startOf("day")
	.add(median(
		sleeps
		.map(({end}) => end)
		.map(end => end.diff(
			end.clone().startOf("day"),
			"h",
			true
		)
	)), "h");


	const isNumber = (val: any): val is number => typeof val === "number";

	const heartRates = sleeps
	.map(({heart_rate}) => heart_rate)
	.filter(isNumber);

	const sleepDurations = sleeps.map(({duration}) => duration);

	console.log();
	console.group();
	console.log("Total sleeps recorded", sleeps.length);
	console.log("Average sleep duration: %fhrs", averageDuration);
	console.log("Estimated total sleep duration: %fhrs", averageDuration * daysInYear);
	console.log("Median sleep duration: %fhrs", median(sleeps.map(({duration}) => duration)));
	console.log("Median bed time", medianBedTime.format("HH:mm:ss"));
	console.log("Median wake time", medianWakeTime.format("HH:mm:ss"));
	console.log("1st percentile sleep duration: %fhrs", quantile(sleepDurations, 0.01));
	console.log("5th percentile sleep duration: %fhrs", quantile(sleepDurations, 0.05));
	console.log("10th percentile sleep duration: %fhrs", quantile(sleepDurations, 0.1));
	console.log("90th percentile sleep duration: %fhrs", quantile(sleepDurations, 0.9));
	console.log("95th percentile sleep duration: %fhrs", quantile(sleepDurations, 0.95));
	console.log("99th percentile sleep duration: %fhrs", quantile(sleepDurations, 0.99));
	console.log("Longest sleep duration: %fhrs", max(sleepDurations));
	console.log("Shortest sleep duration: %fhrs", min(sleepDurations.filter(duration => duration > 1)));
	console.log("Average wake up heart rate: %dbpm", mean(heartRates));
	console.log("Median wake up heart rate: %dbpm", median(heartRates));
	console.log("Lowest wake up heart rate: %dbpm", min(heartRates));
	console.log("Highest wake up heart rate: %dbpm", max(heartRates));
	console.groupEnd();

	const sortedWakeups = sleeps
	.map(({end}) => end)
	.sort((a, b) => b.diff(b.clone().startOf("day"), "hours", true) - a.diff(a.clone().startOf("day"), "hours", true))
	.map(date => date.format("HH:mm:ss"));

	console.group("Latest wakeups");
	sortedWakeups
	.slice(0, 5)
	.forEach((time, i) => console.log(i + 1, time));
	console.groupEnd();

	console.group("Earliest wakeups");
	sortedWakeups
	.reverse()
	.slice(0, 5)
	.forEach((time, i) => console.log(i + 1, time));
	console.groupEnd();

	const sortedBedtimes = sleeps
	.map(({start}) => start.clone())
	.map(start => start.add(12, "h"))
	.sort((a, b) => b.diff(b.clone().startOf("day"), "hours", true) - a.diff(a.clone().startOf("day"), "hours", true))
	.map(start => start.subtract(12, "h"))
	.map(date => date.format("HH:mm:ss"));

	console.group("Latest bedtimes");
	sortedBedtimes
	.slice(0, 5)
	.forEach((time, i) => console.log(i + 1, time));
	console.groupEnd();

	console.group("Earliest bedtimes");
	sortedBedtimes
	.reverse()
	.slice(0, 5)
	.forEach((time, i) => console.log(i + 1, time));
	console.groupEnd();

};

main();
