"use strict";

import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
import * as minimist from "minimist";
import * as moment from "moment";
import { IncrementalMap, SimpleFoursquareCheckin as SimpleCheckin } from "./utils";

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

const checkins: SimpleCheckin[] = JSON.parse(rawJSON, (key, val) => {
	if (key === "date") {
		val = new Date(val);
	}

	return val;
});

const dailyCheckinCountsMap = new IncrementalMap<number>();
const dayOfWeekCountMap = new IncrementalMap<string>();
const monthCountMap = new IncrementalMap<string>();

const startTime = moment(checkins[0].date).startOf("day").startOf("year");
const endTime = moment(checkins[checkins.length - 1].date).startOf("day").endOf("year");
const daysInYear = 365;//endTime.diff(moment(startTime), "days");

for (let i = 0; i < 365; i++) {
	const day = moment(startTime).add(i, "days");
	const dayOfWeekKey = day.format("dddd");

	dayOfWeekCountMap.increment(dayOfWeekKey);
	dailyCheckinCountsMap.set(i + 1, 0);
}

const venuesMap = new IncrementalMap<string>();
const countriesCheckinsMap = new IncrementalMap<string>();
const countriesPlacesSet = new Set<string>();
const citiesCheckinsMap = new IncrementalMap<string>();
const citiesPlacesSet = new Set<string>();
const categoriesMap = new IncrementalMap<string>();
const coffeeShopsMap = new IncrementalMap<string>();
const burgerJointsMap = new IncrementalMap<string>();
const airportsMap = new IncrementalMap<string>();
const mexicanRestaurantsMap = new IncrementalMap<string>();
const sandwichPlacesMap = new IncrementalMap<string>();

checkins.forEach(checkin => {
	const venueKey = `${checkin.venue_name} - ${checkin.venue_id}`;
	const dayOfYear = moment(checkin.date).dayOfYear();
	const monthKey = moment(checkin.date).format("MMMM");

	monthCountMap.increment(monthKey);
	dailyCheckinCountsMap.increment(dayOfYear);

	venuesMap.increment(venueKey);
	countriesCheckinsMap.increment(checkin.venue_cc);
	countriesPlacesSet.add(`${checkin.venue_cc}|${checkin.venue_name}`)

	if (checkin.venue_city) {
		citiesCheckinsMap.increment([checkin.venue_city, checkin.venue_state, checkin.venue_cc].filter(p => p).join(", "));

		citiesPlacesSet.add(`${checkin.venue_city}, ${checkin.venue_cc}|${checkin.venue_name}`);
	}

	const categories = checkin.venue_categories.map(cat => cat.toLowerCase());

	categories.forEach(category => categoriesMap.increment(category));

	//Coffee
	const coffeeShopCategories = ["coffee shop", "café"];

	if (coffeeShopCategories.some(c => categories.includes(c))) {
		coffeeShopsMap.increment(venueKey);
	} else if (categories.includes("burger joint")) {
		burgerJointsMap.increment(venueKey);
	} else if (categories.includes("airport")) {
		airportsMap.increment(venueKey);
	} else if (categories.includes("mexican restaurant")) {
		mexicanRestaurantsMap.increment(venueKey);
	} else if (categories.includes("sandwich place")) {
		sandwichPlacesMap.increment(venueKey);
	}
});

const getCheckinsByDayOfWeek = (data: SimpleCheckin[]) => {
	//create a new Map for holding values for each day of the week; fill it with empty data
	const days = new IncrementalMap<number>();

	data
	.map(({date, venue_id}) => ({day: date.getUTCDay(), venue_id}))
	.forEach(({day}) => days.increment(day));

	return [...days];
};

const checkinsByDayOfWeekSorted = getCheckinsByDayOfWeek(checkins)
.map(([day, value]): [string, number] => [moment().day(day).format("dddd"), value])
.sort(([, a], [, b]) => b - a);

console.log();
console.group("Stats");
console.log("Total checkins: %d", checkins.length);
console.log("Unique places: %d", venuesMap.size);
//console.log("Median checkins per day");
console.log("Places checked in more than once", [...venuesMap].filter(([name, count]) => count > 1).length);
console.log("Places checked in more than twice", [...venuesMap].filter(([name, count]) => count > 2).length);
console.log("Places checked in more than three times", [...venuesMap].filter(([name, count]) => count > 3).length);
console.log("Places checked in more than five times", [...venuesMap].filter(([name, count]) => count > 5).length);
console.log("Places checked in more than ten times", [...venuesMap].filter(([name, count]) => count > 10).length);
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

console.log();
console.group("Checkins by month");
[...monthCountMap]
.forEach(([month, val]) => console.log(`${month}: ${val}`));
console.groupEnd();

const {
	maxStreakDays,
	maxStreakActivities,
	maxDrySpell
} = calculateStreaksForData([...dailyCheckinCountsMap.values()]);

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
console.group("Top countries (checkins)");
[...countriesCheckinsMap]
.sort(([, a], [, b]) => b - a)
.slice(0, 10)
.forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();

console.log();
console.group("Top countries (places)");
[...
	[...countriesPlacesSet]
	.map(name => name.split("|")[0])
	.reduce((map, name) => map.increment(name), new IncrementalMap<string>())
]
.sort(([, a], [, b]) => b - a)
.slice(0, 10)
.forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();

console.log();
console.group("Top cities (checkins)");
[...citiesCheckinsMap]
.sort(([, a], [, b]) => b - a)
.slice(0, 50)
.forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();

console.log();
console.group("Top cities (places)");
[...
	[...citiesPlacesSet]
	.map(name => name.split("|")[0])
	.reduce((map, name) => map.increment(name), new IncrementalMap<string>())
]
.sort(([, a], [, b]) => b - a)
.slice(0, 50)
.forEach(([key, val]) => console.log(`${key}: ${val}`));
console.groupEnd();

console.log()
console.group("Top categories");
[...categoriesMap]
.sort(([, a], [, b]) => b - a)
.slice(0, 100)
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
