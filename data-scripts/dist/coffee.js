"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const simple_statistics_1 = require("simple-statistics");
const moment = require("moment");
const utils_1 = require("./utils");
class NumberArray extends Array {
}
class NumberMap extends Map {
    constructor(entries) {
        super(entries);
    }
}
const isWeekend = (date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
//const addValues = (a: number, b: number) => a + b;
const mapToValue = (day) => day.value;
const calculateStreaksForData = (data) => {
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
        }
        else {
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
const getCoffeesByDayOfWeek = (data) => {
    //create a new Map for holding values for each day of the week; fill it with empty data
    const days = new NumberMap(new NumberArray(7).fill(0).map((v, i) => [i, v]));
    data
        .map(({ date, value }) => [date.getUTCDay(), value])
        .forEach(([day, value]) => days.set(day, (days.get(day) || 0) + value));
    return [...days];
};
const { _: [inFile] } = minimist(process.argv.slice(2));
assert.ok(inFile, "Missing input file argument");
const raw = fs.readFileSync(inFile, "utf8");
const [/*header*/ , ...lines] = raw.split("\n");
const data = lines
    .map((line) => line.split(","))
    .filter(([date]) => date)
    .map(([date, value]) => ({
    date: new Date(date),
    value: Number(value)
}))
    .sort(({ date: a }, { date: b }) => Number(a) - Number(b));
console.log(data[0].date);
console.log(data[data.length - 1].date);
const startTime = moment(data[0].date).startOf("day").startOf("year");
const endTime = moment(data[data.length - 1].date).startOf("day").endOf("year");
const daysInYear = 365; //endTime.diff(moment(startTime), "days");
const dayOfWeekCountMap = new utils_1.IncrementalMap();
console.log("daysInYear", daysInYear);
for (let i = 0; i < daysInYear; i++) {
    const day = moment(startTime).add(i, "days");
    const dayOfWeekKey = day.format("dddd");
    dayOfWeekCountMap.increment(dayOfWeekKey);
}
/*const [{date: firstDate}] = data;
const [{date: lastDate}] = [...data].reverse();
const dateAfterLast = new Date(lastDate);

dateAfterLast.setDate(dateAfterLast.getDate() + 1);*/
const weekdayDays = data.filter(({ date }) => !isWeekend(date));
const weekendDays = data.filter(({ date }) => isWeekend(date));
const dayValues = data.map(mapToValue);
const weekdayValues = weekdayDays.map(mapToValue);
const weekendValues = weekendDays.map(mapToValue);
const totalCount = simple_statistics_1.sum(dayValues);
const weekdayCount = simple_statistics_1.sum(weekdayValues);
const weekendCount = simple_statistics_1.sum(weekendValues);
const medianCoffees = simple_statistics_1.median(dayValues);
const medianWeekdayCoffees = simple_statistics_1.median(weekdayValues);
const medianWeekendCoffees = simple_statistics_1.median(weekendValues);
const modeCoffees = simple_statistics_1.modeFast(dayValues);
const modeWeekdayCoffees = simple_statistics_1.modeFast(weekdayValues);
const modeWeekendCoffees = simple_statistics_1.modeFast(weekendValues);
const mostCoffees = simple_statistics_1.max(dayValues);
const mostWeekdayCoffees = simple_statistics_1.max(weekdayValues);
const mostWeekendCoffees = simple_statistics_1.max(weekendValues);
const coffeelessDays = data.filter(({ value }) => !value);
const coffeelessWeekdays = weekdayDays.filter(({ value }) => !value);
const coffeelessWeekends = weekendDays.filter(({ value }) => !value);
const moreCoffeeThanUsualDays = data.filter(({ value }) => value > modeCoffees);
const coffeesByDayOfWeekSorted = getCoffeesByDayOfWeek(data)
    .map(([day, value]) => [moment().day(day).format("dddd"), value])
    .sort(([, a], [, b]) => b - a);
//const dayOfMostCoffees = coffeesByDayOfWeekSorted[0];
//const dayOfLeastCoffees = coffeesByDayOfWeekSorted[coffeesByDayOfWeekSorted.length - 1];
console.log();
console.group("Coffees by day of week:");
coffeesByDayOfWeekSorted
    .forEach(([day, val]) => console.log(`${day}: ${val}`));
console.groupEnd();
console.log();
console.group("Average coffees by day of week:");
coffeesByDayOfWeekSorted
    .map(([day, val]) => [day, val / (dayOfWeekCountMap.get(day) || 1)])
    .forEach(([day, val]) => console.log(`${day}: ${val}`));
console.groupEnd();
const { maxStreakDays: totalMaxStreakDays, maxStreakCoffees: totalMaxStreakCoffees, maxDrySpell: totalMaxDrySpell } = calculateStreaksForData(dayValues);
const { maxStreakDays: weekdayMaxStreakDays, maxStreakCoffees: weekdayMaxStreakCoffees, maxDrySpell: weekdayMaxDrySpell } = calculateStreaksForData(weekdayValues);
const { maxStreakDays: weekendMaxStreakDays, maxStreakCoffees: weekendMaxStreakCoffees, maxDrySpell: weekendMaxDrySpell } = calculateStreaksForData(weekendValues);
console.log();
console.log("** Stats **");
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
//console.log("day of week with most coffees", dayOfMostCoffees.join(": "));
//console.log("day of week with least coffees", dayOfLeastCoffees.join(": "));
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
//# sourceMappingURL=coffee.js.map