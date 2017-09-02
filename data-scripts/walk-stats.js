"use strict";

const fs = require("fs");
const moment = require("moment");
const stats = require("simple-statistics");

const ridesFilePath = "./data/2016_walking-days.json";

const src = fs.readFileSync(ridesFilePath, "utf8");
const data = JSON.parse(src);
const daysMap = new Map();
const weeksMap = new Map();
const monthsMap = new Map();

const getDefaultStatsObject = () => ({
	"duration": 0,
	"distance": 0,
	"steps": 0,
	"calories": 0
});

data.forEach(({date, summary}) => {
	const mom = moment(date, "YYYYMMDD");
	const dateKey = mom.format("YYYY-MM-DD");
	const weekKey = mom.locale("fr").week();
	const monthKey = mom.locale(false).format("MMMM");

	const day = daysMap.get(dateKey) || getDefaultStatsObject();
	const week = weeksMap.get(weekKey) || getDefaultStatsObject();
	const month = monthsMap.get(monthKey) || getDefaultStatsObject();

	summary.forEach((activity) => {
		Object.keys(day).forEach(metric => {
			const value = activity[metric];

			day[metric] += value;
			week[metric] += value;
			month[metric] += value;
		});
	});

	daysMap.set(dateKey, day);
	weeksMap.set(weekKey, week);
	monthsMap.set(monthKey, month);
});

const sortBySteps = ([, {steps: a} ], [, {steps: b} ]) => b - a;

const daysSortedByStepCount = Array.from(daysMap).sort(sortBySteps);
const monthsSortedByStepCount = Array.from(monthsMap).sort(sortBySteps);

const [greatestStepDay] = daysSortedByStepCount;
const [greatestStepMonth] = monthsSortedByStepCount;

const [worstStepDay] = [...daysSortedByStepCount].reverse();
const [worstStepMonth] = [...monthsSortedByStepCount].reverse();

console.log("\nGreatest Step Day: ", greatestStepDay);
console.log("\nGreatest Step Month: ", greatestStepMonth);
console.log("\nWorst Step Day: ", worstStepDay);
console.log("\nWorst Step Month: ", worstStepMonth);
console.log("Days over 10,000 steps: ", Array.from(daysMap).filter(([, {steps: d}]) => d >= 10000).length);
console.log("Days under 1,000 steps: ", Array.from(daysMap).filter(([, {steps: d}]) => d < 1000).length);

const arrayOfDayStepsAsc = [...daysSortedByStepCount].reverse().map(([, {steps}]) => steps);
const totalSteps = arrayOfDayStepsAsc.reduce((running, current) => running + current, 0);

console.log("Total Steps: ", totalSteps);
console.log("Average Daily Step Count: ", totalSteps / daysSortedByStepCount.length);
console.log("25th percentile steps: ", stats.quantileSorted(arrayOfDayStepsAsc, 0.25));
console.log("50th percentile steps: ", stats.medianSorted(arrayOfDayStepsAsc));
console.log("75th percentile steps: ", stats.quantileSorted(arrayOfDayStepsAsc, 0.75));
console.log("90th percentile steps: ", stats.quantileSorted(arrayOfDayStepsAsc, 0.9));
console.log("95th percentile steps: ", stats.quantileSorted(arrayOfDayStepsAsc, 0.95));
console.log("std dev of steps: ", stats.sampleStandardDeviation(arrayOfDayStepsAsc));

/*
const weeklyTotals = [];

for (let i = 1; i < 54; i++) {
	weeklyTotals.push(weeksMap.get(i) || 0);
}

fs.writeFileSync("./data/2016-weekly-walk-aggregates.json", JSON.stringify(weeklyTotals));
*/
