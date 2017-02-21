"use strict";

const fs = require("fs");

const raw = fs.readFileSync("data/2016_coffee_consumption_raw.csv", "utf8");

const [header, ...lines] = raw.split("\n");

const data = lines
.map(line => line.split(","))
.filter(([date]) => date)
.map(([date, value]) => ({date: new Date(date), value: Number(value)}))
.sort(({date: a}, {date: b}) => a - b);

const [{date: firstDate}] = data;
const [{date: lastDate}] = [...data].reverse();
const dateAfterLast = new Date(lastDate);

dateAfterLast.setDate(dateAfterLast.getDate() + 1);

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
const addValues = (a, b) => a + b;

const weekdayDays = data.filter(({date}) => !isWeekend(date));
const weekendDays = data.filter(({date}) => isWeekend(date));

const totalCount = data.map(({value}) => value).reduce(addValues, 0);
const weekdayCount = weekdayDays.map(({value}) => value).reduce(addValues, 0);
const weekendCount = weekendDays.map(({value}) => value).reduce(addValues, 0);

let maxStreakCoffees = 0;
let maxDrySpell = 0;

const calculateStreaksForData = (data) => {
	let streakCoffees = 0;
	let drySpell = 0;
	maxStreakCoffees = 0;
	maxDrySpell = 0;

	data.forEach(({value}) => {
		if (value) {
			drySpell = 0;
			streakCoffees++;
			maxStreakCoffees = Math.max(maxStreakCoffees, streakCoffees);
		} else {
			streakCoffees = 0;
			drySpell++;
			maxDrySpell = Math.max(maxDrySpell, drySpell);
		}
	});
};

calculateStreaksForData(data);

const totalMaxStreakCoffees = maxStreakCoffees;
const totalMaxDrySpell = maxDrySpell;

calculateStreaksForData(weekdayDays);

const weekdayMaxStreakCoffees = maxStreakCoffees;
const weekdayMaxDrySpell = maxDrySpell;

calculateStreaksForData(weekendDays);

const weekendMaxStreakCoffees = maxStreakCoffees;
const weekendMaxDrySpell = maxDrySpell;

/*for (let current = new Date(firstDate); current < dateAfterLast; current.setDate(current.getDate() + 1)) {
	console.log(current.toISOString())
}*/

console.log("weekdays", weekdayDays.length, weekdayCount);
console.log("weekends", weekendDays.length, weekendCount);
console.log("total days", data.length, totalCount);
console.log("average", totalCount / data.length);
console.log("average (weekdays)", weekdayCount / weekdayDays.length);
console.log("average (weekends)", weekendCount / weekendDays.length);
console.log("longest streak (coffees)", totalMaxStreakCoffees);
console.log("longest dry spell", totalMaxDrySpell);
console.log("longest weekday streak (coffees)", weekdayMaxStreakCoffees);
console.log("longest weekday dry spell", weekdayMaxDrySpell);
console.log("longest weekend streak (coffees)", weekendMaxStreakCoffees);
console.log("longest weekend dry spell", weekendMaxDrySpell);


