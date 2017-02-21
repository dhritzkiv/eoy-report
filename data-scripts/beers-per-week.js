"use strict";

const fs = require("fs");
const moment = require("moment");

const checkinsFilePath = "./data/untappd/checkin-report_01_02_17.json";

const src = fs.readFileSync(checkinsFilePath, "utf8");
const data = JSON.parse(src);

const daysMap = new Map();
const weeksMap = new Map();
const monthsMap = new Map();

data.forEach(({created_at}) => {
	const dateKey = created_at.slice(0, 10);
	const weekKey = moment(created_at).locale("fr").week();
	const monthKey = new Date(created_at).getMonth();

	const beersForDay = daysMap.get(dateKey) || 0;
	const beersForWeek = weeksMap.get(weekKey) || 0;
	const beersForMonth = monthsMap.get(monthKey) || 0;

	const newDistanceForDay = beersForDay + 1;
	const newDistanceForWeek = beersForWeek + 1;
	const newDistanceForMonth = beersForMonth + 1;

	daysMap.set(dateKey, newDistanceForDay);
	weeksMap.set(weekKey, newDistanceForWeek)
	monthsMap.set(monthKey, newDistanceForMonth);
});

const [greatestDay] = Array.from(daysMap).sort(([, a], [, b]) => b - a);
const [greatestMonth] = Array.from(monthsMap).sort(([, a], [, b]) => b - a);

console.log("Greatest Day: ", greatestDay);
console.log("Greatest Month: ", greatestMonth);

const startTime = new Date(2016, 0, 1, 5, 0, 0);
const endTime = new Date(2017, 0, 1, 5, 0, 0);

const monthlyTotals = [];

for (let d = new Date(startTime); d <= endTime; d.setMonth(d.getMonth() + 1)) {
	const monthKey = d.getMonth()
	const value = monthsMap.get(monthKey) || 0;

    monthlyTotals.push(value);
}

const weeklyTotals = [];

for (let i = 1; i <= 53; i++) {
	weeklyTotals.push(weeksMap.get(i) || 0);
}

const dailyTotals = [];
let streak = 0;
let maxStreak = Number.MIN_VALUE;
let drought = 0;
let maxDrought = Number.MIN_VALUE;

for (let d = new Date(startTime); d <= endTime; d.setDate(d.getDate() + 1)) {
	const dateKey = d.toISOString().slice(0, 10);
	const value = daysMap.get(dateKey) || 0;

	if (!value) {
		streak = 0;
		drought++;
	} else {
		drought = 0;
	}

	streak += value;
	maxStreak = Math.max(maxStreak, streak);
	maxDrought = Math.max(maxDrought, drought);

    dailyTotals.push(value);
}

console.log("Streak (beers):", maxStreak);
console.log("Dry spell (days)", maxDrought);

fs.writeFileSync("./data/2016-daily-beer-aggregates.json", JSON.stringify(dailyTotals));
fs.writeFileSync("./data/2016-weekly-beer-aggregates.json", JSON.stringify(weeklyTotals));
fs.writeFileSync("./data/2016-monthly-beer-aggregates.json", JSON.stringify(monthlyTotals));