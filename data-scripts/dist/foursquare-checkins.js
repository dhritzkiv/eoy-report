"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const moment = require("moment");
const utils_1 = require("./utils");
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
const { _: [inFile] } = minimist(process.argv.slice(2));
assert(inFile, "input file not specified");
const rawJSON = fs.readFileSync(inFile, "utf8");
const checkins = JSON.parse(rawJSON, (key, val) => {
    if (key === "date") {
        val = new Date(val);
    }
    return val;
});
const dailyCheckinCountsMap = new utils_1.IncrementalMap();
const dayOfWeekCountMap = new utils_1.IncrementalMap();
const monthCountMap = new utils_1.IncrementalMap();
const startTime = moment(checkins[0].date).startOf("day").startOf("year");
const endTime = moment(checkins[checkins.length - 1].date).startOf("day").endOf("year");
const daysInYear = 365; //endTime.diff(moment(startTime), "days");
for (let i = 0; i < 365; i++) {
    const day = moment(startTime).add(i, "days");
    const dayOfWeekKey = day.format("dddd");
    dayOfWeekCountMap.increment(dayOfWeekKey);
    dailyCheckinCountsMap.set(i + 1, 0);
}
const venuesMap = new utils_1.IncrementalMap();
const countriesMap = new utils_1.IncrementalMap();
const citiesMap = new utils_1.IncrementalMap();
const categoriesMap = new utils_1.IncrementalMap();
const coffeeShopsMap = new utils_1.IncrementalMap();
const burgerJointsMap = new utils_1.IncrementalMap();
const airportsMap = new utils_1.IncrementalMap();
const mexicanRestaurantsMap = new utils_1.IncrementalMap();
const sandwichPlacesMap = new utils_1.IncrementalMap();
checkins.forEach(checkin => {
    const venueKey = `${checkin.venue_name} - ${checkin.venue_id}`;
    const dayOfYear = moment(checkin.date).dayOfYear();
    const monthKey = moment(checkin.date).format("MMMM");
    monthCountMap.increment(monthKey);
    dailyCheckinCountsMap.increment(dayOfYear);
    venuesMap.increment(venueKey);
    countriesMap.increment(checkin.venue_cc);
    if (checkin.venue_city) {
        citiesMap.increment([checkin.venue_city, checkin.venue_state, checkin.venue_cc].filter(p => p).join(", "));
    }
    const categories = checkin.venue_categories.map(cat => cat.toLowerCase());
    categories.forEach(category => categoriesMap.increment(category));
    //Coffee
    const coffeeShopCategories = ["coffee shop", "café"];
    if (coffeeShopCategories.some(c => categories.includes(c))) {
        coffeeShopsMap.increment(venueKey);
    }
    else if (categories.includes("burger joint")) {
        burgerJointsMap.increment(venueKey);
    }
    else if (categories.includes("airport")) {
        airportsMap.increment(venueKey);
    }
    else if (categories.includes("mexican restaurant")) {
        mexicanRestaurantsMap.increment(venueKey);
    }
    else if (categories.includes("sandwich place")) {
        sandwichPlacesMap.increment(venueKey);
    }
});
const getCheckinsByDayOfWeek = (data) => {
    //create a new Map for holding values for each day of the week; fill it with empty data
    const days = new utils_1.IncrementalMap();
    data
        .map(({ date, venue_id }) => ({ day: date.getUTCDay(), venue_id }))
        .forEach(({ day }) => days.increment(day));
    return [...days];
};
const checkinsByDayOfWeekSorted = getCheckinsByDayOfWeek(checkins)
    .map(([day, value]) => [moment().day(day).format("dddd"), value])
    .sort(([, a], [, b]) => b - a);
console.log();
console.group("Stats");
console.log("Total checkins: %d", checkins.length);
console.log("Unique places: %d", venuesMap.size);
console.groupEnd();
console.log();
console.group("Checkins by day of week");
checkinsByDayOfWeekSorted
    .forEach(([day, val]) => console.log(`${day}: ${val}`));
console.groupEnd();
console.log();
console.group("Average checkins by day of week");
checkinsByDayOfWeekSorted
    .map(([day, val]) => [day, val / (dayOfWeekCountMap.get(day) || 1)])
    .forEach(([day, val]) => console.log(`${day}: ${val}`));
console.groupEnd();
const { maxStreakDays, maxStreakActivities, maxDrySpell } = calculateStreaksForData([...dailyCheckinCountsMap.values()]);
console.log();
console.group("Streaks");
console.log("Longest dry spell: %d", maxDrySpell);
console.log("Longest streak: %d (days)", maxStreakDays);
console.log("Longest streak: %d (checkins)", maxStreakActivities);
console.groupEnd();
console.log();
console.log();
console.group("Top venues");
[...venuesMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 25)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top countries");
[...countriesMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top cities");
[...citiesMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top categories");
[...categoriesMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 40)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top coffee shops");
[...coffeeShopsMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top burger places");
[...burgerJointsMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top airports");
[...airportsMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top mexican places");
[...mexicanRestaurantsMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
console.log();
console.group("Top sandwich places");
[...sandwichPlacesMap]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();
//# sourceMappingURL=foursquare-checkins.js.map