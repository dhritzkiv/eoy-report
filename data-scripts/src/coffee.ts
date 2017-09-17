"use strict";

interface CoffeeDay {
	date: Date;
	value: number;
}

type CoffeeDays = CoffeeDay[];

class NumberArray extends Array<number> {}

interface NumberTuple extends NumberArray { 0: number; 1: number; }

class NumberMap extends Map<number, number> {
	constructor(entries?: NumberTuple[]) {
		super(entries);
	}
}

import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import {median, max, sum, modeFast} from "simple-statistics";
import * as moment from "moment";

const isWeekend = (date: Date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
//const addValues = (a: number, b: number) => a + b;
const mapToValue = (day: CoffeeDay) => day.value;

const calculateStreaksForData = (data: number[]) => {
	let streakDays = 0;
	let streakCoffees = 0;
	let drySpell = 0;
	let maxStreakDays = 0;
	let maxStreakCoffees = 0;
	let maxDrySpell = 0;

	data
	.forEach(value => {
		if (value !== 0) {
			drySpell = 0;
			streakDays++;
			streakCoffees += value;
		} else {
			drySpell++;
			streakDays = 0;
			streakCoffees = 0;
		}

		maxStreakDays = Math.max(maxStreakDays, streakDays);
		maxStreakCoffees = Math.max(maxStreakCoffees, streakCoffees);
		maxDrySpell = Math.max(maxDrySpell, drySpell);
	});

	return {
		maxStreakDays,
		maxStreakCoffees,
		maxDrySpell
	};
};

const getCoffeesByDayOfWeek = (data: CoffeeDays): number[] => {
	//create a new Map for holding values for each day of the week; fill it with empty data
	const days: NumberMap = new NumberMap(new NumberArray(7).fill(0).map<NumberTuple>((v: number, i) => [i, v]));

	data
	.map(({date, value}) => [date.getUTCDay(), value])
	.forEach(([day, value]) => days.set(day, days.get(day) + value));

	return [...days.values()];
};

const [inFile] = process.argv.slice(2);

assert.ok(inFile, "Missing input file argument");

const raw = fs.readFileSync(inFile, "utf8");

const [/*header*/, ...lines] = raw.split("\n");

const data: CoffeeDays = lines
.map((line: string) => line.split(","))
.filter(([date]) => date)
.map(([date, value]) => ({
	date: new Date(date),
	value: Number(value)
}))
.sort(({date: a}, {date: b}) => Number(a) - Number(b));

/*const [{date: firstDate}] = data;
const [{date: lastDate}] = [...data].reverse();
const dateAfterLast = new Date(lastDate);

dateAfterLast.setDate(dateAfterLast.getDate() + 1);*/

const weekdayDays = data.filter(({date}) => !isWeekend(date));
const weekendDays = data.filter(({date}) => isWeekend(date));
const dayValues = data.map(mapToValue);
const weekdayValues = weekdayDays.map(mapToValue);
const weekendValues = weekendDays.map(mapToValue)

const totalCount = sum(dayValues);
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
const coffeelessDays = data.filter(({value}) => !value);
const coffeelessWeekdays = weekdayDays.filter(({value}) => !value);
const coffeelessWeekends = weekendDays.filter(({value}) => !value);
const moreCoffeeThanUsualDays = data.filter(({value}) => value > modeCoffees);

const coffeesByDayOfWeekSorted = getCoffeesByDayOfWeek(data)
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
} = calculateStreaksForData(weekendValues);

console.log("\n** Stats **");
console.log("average", totalCount / data.length);
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
console.log("most (weekend)", mostWeekendCoffees);

console.log("\n** Totals **");
console.log("total days recorded", data.length);
console.log("weekdays recorded", weekdayDays.length);
console.log("weekend days recorded", weekendDays.length);
console.log("total coffees", totalCount);
console.log("weekday coffees", weekdayCount);
console.log("weekend coffees", weekendCount);
console.log("total days without coffee", coffeelessDays.length);
console.log("total weekdays without coffee", coffeelessWeekdays.length);
console.log("total weekends without coffee", coffeelessWeekends.length);
console.log("total days with more coffee than usual", moreCoffeeThanUsualDays.length);
console.log("day of week with most coffees", dayOfMostCoffees.join(": "));
console.log("day of week with least coffees", dayOfLeastCoffees.join(": "));

console.log("\n** Streaks **");
console.log("longest streak (days)", totalMaxStreakDays);
console.log("longest streak (coffees)", totalMaxStreakCoffees);
console.log("longest dry spell (days)", totalMaxDrySpell);
console.log("longest weekday streak (days)", weekdayMaxStreakDays);
console.log("longest weekday streak (coffees)", weekdayMaxStreakCoffees);
console.log("longest weekday dry spell (days)", weekdayMaxDrySpell);
console.log("longest weekend streak (days)", weekendMaxStreakDays);
console.log("longest weekend streak (coffees)", weekendMaxStreakCoffees);
console.log("longest weekend dry spell (days)", weekendMaxDrySpell);


