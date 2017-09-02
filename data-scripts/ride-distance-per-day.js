"use strict";

const fs = require("fs");
const moment = require("moment");

const ridesFilePath = "./data/2016_rides.json";

const src = fs.readFileSync(ridesFilePath, "utf8");
const data = JSON.parse(src);
const daysMap = new Map();
const weeksMap = new Map();
const monthsMap = new Map();

data.forEach(({start_date_local, distance}) => {
	const dateKey = start_date_local.slice(0, 10);
	const weekKey = moment(start_date_local).locale("fr").week();
	const monthKey = new Date(start_date_local).getMonth();

	const distanceForDay = daysMap.get(dateKey) || 0;
	const distanceForWeek = weeksMap.get(weekKey) || 0;
	const distanceForMonth = monthsMap.get(monthKey) || 0;

	const newDistanceForDay = distanceForDay + distance;
	const newDistanceForWeek = distanceForWeek + distance;
	const newDistanceForMonth = distanceForMonth + distance;

	daysMap.set(dateKey, newDistanceForDay);
	weeksMap.set(weekKey, newDistanceForWeek);
	monthsMap.set(monthKey, newDistanceForMonth);
});

const [greatestDay] = Array.from(daysMap).sort(([, a], [, b]) => b - a);
const [greatestMonth] = Array.from(monthsMap).sort(([, a], [, b]) => b - a);

console.log("Greatest Day: ", greatestDay);
console.log("Greatest Month: ", greatestMonth);
console.log("Days over 50km: ", Array.from(daysMap).filter(([, d]) => d > 50000).length);

const weeklyTotals = [];

for (let i = 1; i < 54; i++) {
	weeklyTotals.push(weeksMap.get(i) || 0);
}

fs.writeFileSync("./data/2016-weekly-ride-aggregates.json", JSON.stringify(weeklyTotals));
