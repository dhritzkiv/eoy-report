"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const utils_1 = require("./utils");
const { _: [inFile] } = minimist(process.argv.slice(2));
assert(inFile, "input file not specified");
const rawJSON = fs.readFileSync(inFile, "utf8");
const checkins = JSON.parse(rawJSON, (key, val) => {
    if (key === "date") {
        val = new Date(val);
    }
    return val;
});
const venuesMap = new utils_1.IncrementalMap();
const countriesMap = new utils_1.IncrementalMap();
const citiesMap = new utils_1.IncrementalMap();
const categoriesMap = new utils_1.IncrementalMap();
const coffeeShopsMap = new utils_1.IncrementalMap();
checkins.forEach(checkin => {
    venuesMap.increment(`${checkin.venue_name} - ${checkin.venue_id}`);
    countriesMap.increment(checkin.venue_cc);
    if (checkin.venue_city) {
        citiesMap.increment([checkin.venue_city, checkin.venue_state, checkin.venue_cc].filter(p => p).join(", "));
    }
    const categories = checkin.venue_categories.map(cat => cat.toLowerCase());
    categories.forEach(category => categoriesMap.increment(category));
    //Coffee
    const coffeeShopCategories = ["coffee shop", "café"];
    if (coffeeShopCategories.some(c => categories.includes(c))) {
        coffeeShopsMap.increment(`${checkin.venue_name} - ${checkin.venue_id}`);
    }
});
console.log();
console.group("Stats");
console.log("Total checkins: %d", checkins.length);
console.log("Unique places: %d", venuesMap.size);
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
//# sourceMappingURL=foursquare-checkins.js.map