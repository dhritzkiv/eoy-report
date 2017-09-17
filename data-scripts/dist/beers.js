"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const moment = require("moment");
const simple_statistics_1 = require("simple-statistics");
class Checkin {
}
Checkin.from = (input) => {
    const checkin = new Checkin();
    checkin.beer_name = input.beer_name;
    checkin.brewery_name = input.brewery_name;
    checkin.brewery_country = input.brewery_country;
    checkin.brewery_city = input.brewery_city;
    checkin.brewery_state = input.brewery_state;
    checkin.beer_type = input.beer_type;
    checkin.venue_name = input.venue_name;
    checkin.venue_city = input.venue_city;
    checkin.venue_state = input.venue_state;
    checkin.venue_country = input.venue_country;
    checkin.checkin_url = input.checkin_url;
    checkin.beer_abv = parseFloat(input.beer_abv);
    checkin.beer_ibu = parseFloat(input.beer_ibu);
    checkin.venue_lat = parseFloat(input.venue_lat);
    checkin.venue_lng = parseFloat(input.venue_lng);
    checkin.rating_score = parseFloat(input.rating_score);
    checkin.created_at = new Date(input.created_at);
    if (input.checkin_url) {
        const match = input.checkin_url.match(/([0-9]+)$/);
        checkin.checkin_id = match && match[1];
    }
    if (input.beer_url) {
        const match = input.beer_url.match(/([0-9]+)$/);
        checkin.beer_id = match && match[1];
    }
    if (input.brewery_url) {
        const match = input.brewery_url.match(/([0-9]+)$/);
        checkin.brewery_id = match && match[1];
    }
    return checkin;
};
class IncrementalMap extends Map {
    constructor(...args) {
        super(...args);
    }
    increment(key, count = 1) {
        return this.set(key, (this.get(key) || 0) + count);
    }
}
const args = process.argv.slice(2);
const argPairs = args.map(arg => arg.split("="));
const inFile = argPairs.filter(arg => arg.length === 1).map(([val]) => val).find(v => Boolean(v));
const yearKv = argPairs.filter(arg => arg.length > 1).find(([key]) => /year/.test(key));
const year = yearKv ? parseInt(yearKv[1], 10) : null;
assert.ok(inFile, "Missing input file argument. Pass JSON history from Untappd as input file");
const src = fs.readFileSync(inFile, "utf8");
const data = JSON.parse(src);
const checkins = data.map(raw => Checkin.from(raw));
const startYear = year || checkins[0].created_at.getFullYear();
const endYear = (year && year || checkins[checkins.length - 1].created_at.getFullYear()) + 1;
const startTime = new Date(startYear, 0, 1, 5, 0, 0);
const endTime = new Date(endYear, 0, 1, 5, 0, 0);
const daysInYear = ((endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60 / 24);
const dayOfWeekMap = new IncrementalMap();
const daysMap = new IncrementalMap();
const weeksMap = new IncrementalMap();
const monthsMap = new IncrementalMap();
const brewMap = new IncrementalMap();
const breweryMap = new IncrementalMap();
const breweryCityMap = new IncrementalMap();
const breweryStateMap = new IncrementalMap();
const breweryCountryMap = new IncrementalMap();
const breweryCityByBreweryMap = new IncrementalMap();
const breweryStateByBreweryMap = new IncrementalMap();
const breweryCountryByBreweryMap = new IncrementalMap();
const styleMap = new IncrementalMap();
const venueMap = new IncrementalMap();
const venueCityMap = new IncrementalMap();
const venueStateMap = new IncrementalMap();
const venueCountryMap = new IncrementalMap();
const majorStyleMap = new IncrementalMap();
checkins
    .filter(({ created_at }) => created_at > startTime && created_at < endTime)
    .forEach(({ created_at, brewery_name, brewery_city, brewery_state, brewery_country, beer_name, beer_id, beer_type, venue_name, venue_city, venue_state, venue_country }) => {
    const dayOfWeekKey = moment(created_at).format("dddd");
    const dateKey = created_at.toISOString().slice(0, 10);
    const weekKey = moment(created_at).locale("fr").format("YYYY-W");
    const monthKey = new Date(created_at).getMonth();
    const brewKey = `${beer_name}|${beer_id}`;
    const majorStyleKey = beer_type.split(" - ")[0];
    dayOfWeekMap.increment(dayOfWeekKey);
    daysMap.increment(dateKey);
    weeksMap.increment(weekKey);
    monthsMap.increment(monthKey);
    brewMap.increment(brewKey);
    breweryMap.increment(brewery_name);
    breweryCityMap.increment(brewery_city);
    if (breweryMap.get(brewery_name) === 1) {
        if (brewery_city) {
            breweryCityByBreweryMap.increment(brewery_city);
        }
        if (brewery_state) {
            breweryStateByBreweryMap.increment(brewery_state);
        }
        if (brewery_country) {
            breweryCountryByBreweryMap.increment(brewery_country);
        }
    }
    if (brewery_state) {
        breweryStateMap.increment(brewery_state);
    }
    breweryCountryMap.increment(brewery_country);
    styleMap.increment(beer_type);
    majorStyleMap.increment(majorStyleKey);
    if (venue_name) {
        venueMap.increment(venue_name);
        if (venue_city) {
            venueCityMap.increment(venue_city);
        }
        if (venue_state) {
            venueStateMap.increment(venue_state);
        }
        if (venue_country) {
            venueCountryMap.increment(venue_country);
        }
    }
});
const sortTotalDesc = ([, a], [, b]) => b - a;
const colonJoiner = arr => arr.join(": ");
const logEachInOrderedList = (item, index) => console.log(`${index + 1}. ${item.join(": ")}`);
const [greatestDay] = Array.from(daysMap).sort(sortTotalDesc);
const [greatestWeek] = Array.from(weeksMap).sort(sortTotalDesc);
const [greatestMonth] = Array.from(monthsMap).sort(sortTotalDesc);
console.log("\n");
console.log("Beers by Day of Week");
Array.from(dayOfWeekMap)
    .sort(sortTotalDesc)
    .forEach(entry => console.log(entry.join(": ")));
console.log("\n");
console.log("Top 10 Beers");
Array.from(brewMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .map(([name, val]) => [name.split("|")[0], val])
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Breweries");
Array.from(breweryMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Brewery Cities by Checkins");
Array.from(breweryCityMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Brewery Cities by Brewery");
Array.from(breweryCityByBreweryMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Brewery Regions by Checkins");
Array.from(breweryStateMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Brewery Regions by Brewery");
Array.from(breweryStateByBreweryMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Brewery Countries by Checkins");
Array.from(breweryCountryMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Brewery Countries by Brewery");
Array.from(breweryCountryByBreweryMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Styles");
Array.from(styleMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Main Styles");
Array.from(majorStyleMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Beers per Venue");
Array.from(venueMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Beers per Venue Cities");
Array.from(venueCityMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Beers per Venue Region");
Array.from(venueStateMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
console.log("\n");
console.log("Top 10 Beers per Venue Countries");
Array.from(venueCountryMap)
    .sort(sortTotalDesc)
    .slice(0, 10)
    .forEach(logEachInOrderedList);
const weekToDate = (week) => moment(week, "YYYY-W").toDate();
console.log("\n");
console.log("Greatest Day: %s (%d)", ...greatestDay);
console.log("Greatest Week: %s (%d)", weekToDate(greatestWeek[0]).toDateString(), greatestWeek[1]); //todo: also implement as a rolling week
console.log("Greatest Month: %s (%d)", moment().month(greatestMonth[0]).format("MMMM"), greatestMonth[1]);
const monthlyTotals = [];
for (let d = new Date(startTime); d <= endTime; d.setMonth(d.getMonth() + 1)) {
    const monthKey = d.getMonth();
    const value = monthsMap.get(monthKey) || 0;
    monthlyTotals.push(value);
}
const weeklyTotals = [];
for (let y = startYear; y <= endYear; y++) {
    for (let i = 1; i <= 53; i++) {
        weeklyTotals.push(weeksMap.get(`${y - i}`) || 0);
    }
}
const dailyTotals = [];
let streakDays = 0;
let streakBeers = 0;
let maxStreakBeers = 0;
let maxStreakDays = 0;
let drought = 0;
let maxDrought = 0;
for (let d = new Date(startTime); d <= endTime; d.setDate(d.getDate() + 1)) {
    if (d > new Date()) {
        break;
    }
    const dateKey = d.toISOString().slice(0, 10);
    const value = daysMap.get(dateKey) || 0;
    if (!value) {
        streakBeers = 0;
        streakDays = 0;
        drought++;
    }
    else {
        drought = 0;
    }
    streakBeers += value;
    streakDays++;
    maxStreakBeers = Math.max(maxStreakBeers, streakBeers);
    maxStreakDays = Math.max(maxStreakDays, streakDays);
    maxDrought = Math.max(maxDrought, drought);
    dailyTotals.push(value);
}
const daysWithoutABeer = dailyTotals.filter(total => !total);
const daysWithABeer = dailyTotals.filter(total => total > 0);
console.log("\n");
console.log("Total days recorded", dailyTotals.length);
console.log("Days without a beer:", daysWithoutABeer.length);
console.log("Days with a beer:", daysWithABeer.length);
console.log("Total beers:", simple_statistics_1.sum(daysWithABeer));
console.log("Beers I've had more than once:", [...brewMap.values()].filter(v => v > 1).length);
console.log("Beers I've had more than twice:", [...brewMap.values()].filter(v => v > 2).length);
console.log("Total unique beers:", brewMap.size);
console.log("Total unique breweries:", breweryMap.size);
console.log("Total unique venues:", venueMap.size);
console.log("\n");
console.log("Average daily beers (all days):", simple_statistics_1.sum(dailyTotals) / dailyTotals.length);
console.log("Average daily beers (non-dry days):", simple_statistics_1.sum(daysWithABeer) / daysWithABeer.length);
console.log("Median daily beers (all days):", simple_statistics_1.median(dailyTotals));
console.log("Median daily beers (non-dry days):", simple_statistics_1.median(daysWithABeer));
console.log("Mode daily beers:", simple_statistics_1.modeFast(dailyTotals));
console.log("Days with more beers than usual:", daysWithABeer.filter(total => total > simple_statistics_1.median(dailyTotals)).length);
console.log("\n");
console.log("Longest streak (beers):", maxStreakBeers);
console.log("Longest streak (days):", maxStreakDays);
console.log("Longest dry spell (days):", maxDrought);
//# sourceMappingURL=beers.js.map