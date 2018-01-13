"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const moment = require("moment");
const utils_1 = require("./utils");
const csvtojson = require("csvtojson");
class NumberArray extends Array {
}
class NumberMap extends Map {
    constructor(entries) {
        super(entries);
    }
}
const getCSVasJS = (string) => new Promise((resolve, reject) => {
    const data = [];
    csvtojson()
        .fromString(string)
        .on("json", (json) => data.push(json))
        .on('done', (err) => {
        if (err) {
            return reject(err);
        }
        resolve(data);
    });
});
const isWeekend = (date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;
//const addValues = (a: number, b: number) => a + b;
const mapToValue = (film) => film.name;
const calculateStreaksForData = (data) => {
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
        }
        else {
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
const getFilmsByDayOfWeek = (data) => {
    //create a new Map for holding values for each day of the week; fill it with empty data
    const days = new utils_1.IncrementalMap();
    data
        .map(({ date, name }) => ({ day: date.getUTCDay(), name }))
        .forEach(({ day, name }) => days.increment(day));
    return [...days];
};
const { _: [inFile] } = minimist(process.argv.slice(2));
assert.ok(inFile, "Missing input file argument");
const raw = fs.readFileSync(inFile, "utf8");
const main = async () => {
    const data = await getCSVasJS(raw);
    const films = data
        .map((datum) => {
        return {
            date: new Date(datum["Watched Date"]),
            name: datum.Name,
            year: parseInt(datum.Year),
            tags: datum.Tags.split(",").map(word => word.trim().toLowerCase())
        };
    })
        .sort(({ date: a }, { date: b }) => Number(a) - Number(b));
    const startTime = moment(films[0].date).startOf("day").startOf("year");
    const endTime = moment(films[data.length - 1].date).startOf("day").endOf("year");
    const daysInYear = 365; //endTime.diff(moment(startTime), "days");
    const dailyFilmCountsMap = new utils_1.IncrementalMap();
    const dayOfWeekCountMap = new utils_1.IncrementalMap();
    const monthCountMap = new utils_1.IncrementalMap();
    for (let i = 0; i < daysInYear; i++) {
        const day = moment(startTime).add(i, "days");
        const dayOfWeekKey = day.format("dddd");
        dayOfWeekCountMap.increment(dayOfWeekKey);
        dailyFilmCountsMap.set(i + 1, 0);
    }
    const filmsByDayOfWeekSorted = getFilmsByDayOfWeek(films)
        .map(([day, value]) => [moment().day(day).format("dddd"), value])
        .sort(([, a], [, b]) => b - a);
    const releaseYearMap = new utils_1.IncrementalMap();
    films.forEach(({ year, date }) => {
        releaseYearMap.increment(year);
        const dayOfYear = moment(date).dayOfYear();
        const monthKey = moment(date).format("MMMM");
        monthCountMap.increment(monthKey);
        dailyFilmCountsMap.increment(dayOfYear);
    });
    console.log();
    console.group("Films by release year");
    [...releaseYearMap]
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([year, count]) => console.log("%d: %d", year, count));
    console.groupEnd();
    console.log();
    console.group("Films by day of week");
    filmsByDayOfWeekSorted
        .forEach(([day, val]) => console.log(`${day}: ${val}`));
    console.groupEnd();
    console.log();
    console.group("Average films by day of week");
    filmsByDayOfWeekSorted
        .map(([day, val]) => [day, val / (dayOfWeekCountMap.get(day) || 1)])
        .forEach(([day, val]) => console.log(`${day}: ${val}`));
    console.groupEnd();
    console.log();
    console.group("Films by month");
    [...monthCountMap]
        .forEach(([month, val]) => console.log(`${month}: ${val}`));
    console.groupEnd();
    const weekdayDays = films.filter(({ date }) => !isWeekend(date));
    const weekendDays = films.filter(({ date }) => isWeekend(date));
    //const dayValues = data.map(mapToValue);
    const weekdayValues = weekdayDays.map(mapToValue);
    const weekendValues = weekendDays.map(mapToValue);
    console.log();
    console.log("Total films: %d", films.length);
    console.log("Films watched on weekdays: %d", weekdayValues.length);
    console.log("Films watched on weekends: %d", weekendValues.length);
    console.log("Films watched on Netflix: %d", films.filter(({ tags }) => tags.includes("netflix")).length);
    const { maxStreakDays, maxStreakActivities, maxDrySpell } = calculateStreaksForData([...dailyFilmCountsMap.values()]);
    console.log("Longest dry spell: %d", maxDrySpell);
    console.log("Longest streak: %d (days)", maxStreakDays);
    console.log("Longest streak: %d (films)", maxStreakActivities);
};
main();
//# sourceMappingURL=films.js.map