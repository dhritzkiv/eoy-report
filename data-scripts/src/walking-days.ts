"use strict";

import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
import * as minimist from "minimist";
import * as moment from "moment";
import { IncrementalMap, WalkingDay } from "./utils";
import {quantile, median, mean, max, min, sum, modeFast as mode, standardDeviation} from "simple-statistics";

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

const {_: [inFile]} = minimist(process.argv.slice(2));

assert(inFile, "input file not specified");

const rawJSON = fs.readFileSync(inFile, "utf8");

const days: WalkingDay[] = JSON.parse(rawJSON);

const dayOfWeekCountMap = new IncrementalMap<string>();

const monthlyStepCountByDaysMap = new Map<string, number[]>();
const dayOfWeekStepCountMap = new IncrementalMap<string>();
const dailyStepCountMap = new IncrementalMap<string>();

const monthlyDistanceCountByDaysMap = new Map<string, number[]>();
const dayOfWeekDistanceCountMap = new IncrementalMap<string>();
const dailyDistanceCountMap = new IncrementalMap<string>();

const monthlyDurationCountByDaysMap = new Map<string, number[]>();
const dayOfWeekDurationCountMap = new IncrementalMap<string>();
const dailyDurationCountMap = new IncrementalMap<string>();

const monthlyCaloriesCountByDaysMap = new Map<string, number[]>();
const dayOfWeekCaloriesCountMap = new IncrementalMap<string>();
const dailyCaloriesCountMap = new IncrementalMap<string>();

const startTime = moment(days[0].date).startOf("day").startOf("year");
const endTime = moment(days[days.length - 1].date).startOf("day").endOf("year");
const daysInYear = 365;//endTime.diff(moment(startTime), "days");

for (let i = 0; i < 365; i++) {
	const day = moment(startTime).add(i, "days");
	const dayOfWeekKey = day.format("dddd");

	dayOfWeekCountMap.increment(dayOfWeekKey);
}

days.forEach(day => {
	const date = moment(day.date)
	const dateKey = date.toISOString();
	const dayOfWeekKey = date.format("dddd");
	const monthKey = date.format("MMMM");

	day.summary.forEach(activity => {
		dailyStepCountMap.increment(dateKey, activity.steps);
		dayOfWeekStepCountMap.increment(dayOfWeekKey, activity.steps);

		dailyDistanceCountMap.increment(dateKey, activity.distance);
		dayOfWeekDistanceCountMap.increment(dayOfWeekKey, activity.distance);

		dailyDurationCountMap.increment(dateKey, activity.duration);
		dayOfWeekDurationCountMap.increment(dayOfWeekKey, activity.duration);

		dailyCaloriesCountMap.increment(dateKey, activity.duration);
		dayOfWeekCaloriesCountMap.increment(dayOfWeekKey, activity.duration);
	});



	const monthDaySteps = monthlyStepCountByDaysMap.get(monthKey) || [];
	const monthDayDistance = monthlyStepCountByDaysMap.get(monthKey) || [];
	const monthDayDuration = monthlyStepCountByDaysMap.get(monthKey) || [];
	const monthDayCalories = monthlyStepCountByDaysMap.get(monthKey) || [];

	monthDaySteps.push(day.summary.map(activity => activity.steps).reduce((a, b) => a + b, 0));
	monthDayDistance.push(day.summary.map(activity => activity.distance).reduce((a, b) => a + b, 0));
	monthDayDuration.push(day.summary.map(activity => activity.duration).reduce((a, b) => a + b, 0));
	monthDayCalories.push(day.summary.map(activity => activity.calories).reduce((a, b) => a + b, 0));

	monthlyStepCountByDaysMap.set(monthKey, monthDaySteps);
	monthlyDistanceCountByDaysMap.set(monthKey, monthDayDistance);
	monthlyDurationCountByDaysMap.set(monthKey, monthDayDuration);
	monthlyCaloriesCountByDaysMap.set(monthKey, monthDayCalories);
});

console.group("Stats");
console.log("Total recorded days: %d", dailyStepCountMap.size);
console.groupEnd();

console.group("Steps");
const daysRecorded = dailyStepCountMap.size;
const dailyStepCountValues = [...dailyStepCountMap.values()];
const averageDailyStepCount = mean(dailyStepCountValues);
const medianDailyStepCount = median(dailyStepCountValues);
console.log("Daily average step count: %d", averageDailyStepCount);
console.log("Estimated total step count: %d", averageDailyStepCount * 365);
console.log("Daily median step count: %d", medianDailyStepCount);
console.log("Daily max step count: %d", max(dailyStepCountValues));

console.log("Days with less than 1000 steps", dailyStepCountValues.filter(v => v < 1000).length / daysRecorded * 365);
console.log("Days with less than 2000 steps", dailyStepCountValues.filter(v => v < 2000).length / daysRecorded * 365);
console.log("Days with less than 3000 steps", dailyStepCountValues.filter(v => v < 3000).length / daysRecorded * 365);
console.log("Days with more than 10000 steps", dailyStepCountValues.filter(v => v >= 10000).length / daysRecorded * 365);
console.groupEnd();

console.group("Distance");
const dailyDistanceCountValues = [...dailyDistanceCountMap.values()];
const averageDailyDistanceCount = mean(dailyDistanceCountValues);
const medianDailyDistanceCount = median(dailyDistanceCountValues);
console.log("Daily average distance: %dkm", averageDailyDistanceCount / 1000);
console.log("Estimated total distance: %dkm", averageDailyDistanceCount * 365 / 1000);
console.log("Daily median distance: %dkm", medianDailyDistanceCount / 1000);
console.log("Daily max distance: %dkm", max(dailyDistanceCountValues) / 1000);
console.groupEnd();

console.group("Duration");
const dailyDurationCountValues = [...dailyDurationCountMap.values()];
const averageDailyDurationCount = mean(dailyDurationCountValues);
const medianDailyDurationCount = median(dailyDurationCountValues);
const secondsToHours = (seconds: number) => seconds / 60 / 60;
console.log("Daily average duration: %dhrs", secondsToHours(averageDailyDurationCount));
console.log("Estimated total duration: %dhrs", secondsToHours(averageDailyDurationCount) * 365);
console.log("Daily median duration: %dhrs", secondsToHours(medianDailyDurationCount));
console.log("Daily max duration: %dhrs", secondsToHours(max(dailyDurationCountValues)));
console.groupEnd();

console.log();
console.group("Average steps by day of week:");
[...dayOfWeekStepCountMap]
.map(([day, val]) => [day, val / (dayOfWeekCountMap.get(day) || 1)])
.forEach(([day, val]) => console.log(`${day}: ${val}`));
console.groupEnd();

const mapMonthDaysAveragesToFullMonths = ([month, days]: [string, number[]], index: number) => {
	const averageStepCount = mean(days);
	const daysInMonth = moment().month(index).daysInMonth();
	const totalStepsInMonth = averageStepCount * daysInMonth;

	return [month, totalStepsInMonth];
};

console.log();
console.group("Steps by month:");
[...monthlyStepCountByDaysMap]
.map(mapMonthDaysAveragesToFullMonths)
.forEach(([month, val]) => console.log(`${month}: ${val}`));
console.groupEnd();

console.log();
console.group("Distance by month:");
[...monthlyDistanceCountByDaysMap]
.map(mapMonthDaysAveragesToFullMonths)
.forEach(([month, val]) => console.log(`${month}: ${val}`));
console.groupEnd();

console.log();
console.group("Duration by month:");
[...monthlyDurationCountByDaysMap]
.map(mapMonthDaysAveragesToFullMonths)
.forEach(([month, val]) => console.log(`${month}: ${val}`));
console.groupEnd();

console.log();
console.group("Calories by month:");
[...monthlyCaloriesCountByDaysMap]
.map(mapMonthDaysAveragesToFullMonths)
.forEach(([month, val]) => console.log(`${month}: ${val}`));
console.groupEnd();
