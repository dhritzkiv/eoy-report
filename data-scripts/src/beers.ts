import * as fs from "fs";
import * as assert from "assert";
import * as minimist from "minimist";
import * as moment from "moment";
import {median, sum, modeFast} from "simple-statistics";
import {IncrementalMap} from "./utils";

interface CheckinBase {
	beer_name: string;
	beer_type: string;
	beer_url: string;
	brewery_name: string;
	brewery_country: string;
	brewery_city: string;
	brewery_state: string;
	brewery_url: string;
	venue_name: string;
	venue_city: string;
	venue_state: string;
	venue_country: string;
	checkin_url: string;
}

interface CheckinRaw extends CheckinBase {
	beer_abv: string;
	beer_ibu: string;
	venue_lat: string;
	venue_lng: string;
	rating_score: string;
	created_at: string;
}

interface Checkin extends CheckinBase {
	beer_abv: number;
	beer_ibu: number;
	venue_lat: number;
	venue_lng: number;
	rating_score: number;
	created_at: Date;
}

class Checkin implements Checkin {
	checkin_id: string | null;
	beer_id: string | null;
	brewery_id: string | null;

	static from = (input: CheckinRaw): Checkin => {
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
	}
}

const args = minimist(process.argv.slice(2));
const {_: [inFile], year} = args;

assert.ok(inFile, "Missing input file argument. Pass JSON history from Untappd as input file");

const src = fs.readFileSync(<string>inFile, "utf8");
const data: CheckinRaw[] = JSON.parse(src);
const checkins: Checkin[] = data.map(raw => Checkin.from(raw));

const startYear = year || checkins[0].created_at.getFullYear();
const endYear = (year && year || checkins[checkins.length - 1].created_at.getFullYear()) + 1;
const startTime = new Date(startYear, 0, 1, 5, 0, 0);
const endTime = new Date(endYear, 0, 1, 5, 0, 0);
const daysInYear = ((endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60 / 24);

const dayOfWeekMap = new IncrementalMap<string>();
const beersPerDayOfWeekMap = new IncrementalMap<string>();
const daysMap = new IncrementalMap<string>();
const weeksMap = new IncrementalMap<string>();
const monthsMap = new IncrementalMap<number>();
const brewMap = new IncrementalMap<string>();
const breweryMap = new IncrementalMap<Checkin["brewery_name"]>();
const breweryCityMap = new IncrementalMap<Checkin["brewery_city"]>();
const breweryStateMap = new IncrementalMap<Checkin["brewery_state"]>();
const breweryCountryMap = new IncrementalMap<Checkin["brewery_country"]>();
const breweryCityByBreweryMap = new IncrementalMap<Checkin["brewery_city"]>();
const breweryStateByBreweryMap = new IncrementalMap<Checkin["brewery_state"]>();
const breweryCountryByBreweryMap = new IncrementalMap<Checkin["brewery_country"]>();
const styleMap = new IncrementalMap<Checkin["brewery_country"]>();
const venueMap = new IncrementalMap<Checkin["venue_name"]>();
const venueCityMap = new IncrementalMap<Checkin["venue_city"]>();
const venueStateMap = new IncrementalMap<Checkin["venue_state"]>();
const venueCountryMap = new IncrementalMap<Checkin["venue_country"]>();
const majorStyleMap = new IncrementalMap<string>();

checkins
.filter(({created_at}) => created_at > startTime && created_at < endTime)
.forEach(({created_at, brewery_name, brewery_city, brewery_state, brewery_country, beer_name, beer_id, beer_type, venue_name, venue_city, venue_state, venue_country}) => {
	const dayOfWeekKey = moment(created_at).format("dddd");
	const dateKey = created_at.toISOString().slice(0, 10);
	const weekKey = moment(created_at).format("YYYY-w");
	const monthKey = new Date(created_at).getMonth();
	const brewKey = `${beer_name}|${beer_id}`;
	const majorStyleKey = beer_type.split(" - ")[0];

	beersPerDayOfWeekMap.increment(dayOfWeekKey);
	daysMap.increment(dateKey);
	weeksMap.increment(weekKey);
	monthsMap.increment(monthKey);
	brewMap.increment(brewKey);
	breweryMap.increment(brewery_name);
	breweryCityMap.increment(`${brewery_city}, ${brewery_state}`);

	if (breweryMap.get(brewery_name) === 1) {
		if (brewery_city) {
			breweryCityByBreweryMap.increment(`${brewery_city}, ${brewery_state}`);
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
			venueCityMap.increment(`${venue_city}, ${venue_state}`);
		}

		if (venue_state) {
			venueStateMap.increment(venue_state);
		}

		if (venue_country) {
			venueCountryMap.increment(venue_country);
		}
	}
});

const sortTotalDesc = ([, a]: [any, number], [, b]: [any, number]) => b - a;
const colonJoiner = arr => arr.join(": ");
const logEachInOrderedList = (item, index) => console.log(`${index + 1}. ${item.join(": ")}`);

const weeksSorted = Array.from(weeksMap).sort(sortTotalDesc);
const [greatestDay] = Array.from(daysMap).sort(sortTotalDesc);
const [greatestWeek] = weeksSorted;
const dryestWeek = weeksSorted[weeksSorted.length - 1];
const [greatestMonth, ...otherMonths] = Array.from(monthsMap).sort(sortTotalDesc);
const dryestMonth = otherMonths[otherMonths.length - 1];

console.log("\n");
console.log("Top 60 Beers");
Array.from(brewMap)
.sort(sortTotalDesc)
.slice(0, 60)
.map(([name, val]) => [name.split("|")[0], val])
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 30 Breweries");
Array.from(breweryMap)
.sort(sortTotalDesc)
.slice(0, 30)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 30 Brewery Cities by Checkins");
Array.from(breweryCityMap)
.sort(sortTotalDesc)
.slice(0, 30)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 30 Brewery Cities by Brewery");
Array.from(breweryCityByBreweryMap)
.sort(sortTotalDesc)
.slice(0, 30)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 30 Brewery Regions by Checkins");
Array.from(breweryStateMap)
.sort(sortTotalDesc)
.slice(0, 30)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 30 Brewery Regions by Brewery");
Array.from(breweryStateByBreweryMap)
.sort(sortTotalDesc)
.slice(0, 30)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 20 Brewery Countries by Checkins");
Array.from(breweryCountryMap)
.sort(sortTotalDesc)
.slice(0, 20)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 20 Brewery Countries by Brewery");
Array.from(breweryCountryByBreweryMap)
.sort(sortTotalDesc)
.slice(0, 20)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 30 Styles");
Array.from(styleMap)
.sort(sortTotalDesc)
.slice(0, 30)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 20 Main Styles");
Array.from(majorStyleMap)
.sort(sortTotalDesc)
.slice(0, 20)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 20 Venues by Checkins");
Array.from(venueMap)
.sort(sortTotalDesc)
.slice(0, 20)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 10 Venue Cities by Checkins");
Array.from(venueCityMap)
.sort(sortTotalDesc)
.slice(0, 10)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 10 Venue Regions by Checkins");
Array.from(venueStateMap)
.sort(sortTotalDesc)
.slice(0, 10)
.forEach(logEachInOrderedList);

console.log("\n");
console.log("Top 10 Venue Countries by Checkins");
Array.from(venueCountryMap)
.sort(sortTotalDesc)
.slice(0, 10)
.forEach(logEachInOrderedList);

const weekToDate = (week: string): Date => moment(week, "YYYY-w").toDate();

console.log("\n");
console.log("Greatest Day: %s (%d)", ...greatestDay);
console.log("Greatest Week: %s (%d)", weekToDate(greatestWeek[0]).toDateString(), greatestWeek[1]);//todo: also implement as a rolling week
console.log("Dryest Week: %s (%d)", weekToDate(dryestWeek[0]).toDateString(), dryestWeek[1]);
console.log("Greatest Month: %s (%d)", moment().month(greatestMonth[0]).format("MMMM"), greatestMonth[1]);
console.log("Dryest Month: %s (%d)", moment().month(dryestMonth[0]).format("MMMM"), dryestMonth[1]);

const monthlyTotals: number[] = [];

for (let d = new Date(startTime); d <= endTime; d.setMonth(d.getMonth() + 1)) {
	const monthKey = d.getMonth()
	const value = monthsMap.get(monthKey) || 0;

    monthlyTotals.push(value);
}

const weeklyTotals: number[] = [];

for (let y = startYear; y <= endYear; y++) {
	for (let i = 1; i <= 53; i++) {
		weeklyTotals.push(weeksMap.get(`${y-i}`) || 0);
	}
}

const dailyTotals: number[] = [];
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

	const dayOfWeekKey = moment(d).format("dddd");

	dayOfWeekMap.increment(dayOfWeekKey);

	const dateKey = d.toISOString().slice(0, 10);
	const value = daysMap.get(dateKey) || 0;

	if (!value) {
		streakBeers = 0;
		streakDays = 0;
		drought++;
	} else {
		drought = 0;
	}

	streakBeers += value;
	streakDays++;
	maxStreakBeers = Math.max(maxStreakBeers, streakBeers);
	maxStreakDays = Math.max(maxStreakDays, streakDays);
	maxDrought = Math.max(maxDrought, drought);

    dailyTotals.push(value);
}

console.log("\n");
console.log("Beers by Month");
Array.from(monthsMap)
//.sort(sortTotalDesc)
.forEach(entry => console.log(entry.join(": ")));

console.log("\n");
console.log("Beers by Day of Week");
Array.from(beersPerDayOfWeekMap)
.sort(sortTotalDesc)
.forEach(entry => console.log(entry.join(": ")));

console.log("\n");
console.log("Average beers per day of week");
Array.from(dayOfWeekMap)
.map(([day, number]) : [string, number] => {
	const numberOfBeersForDay = beersPerDayOfWeekMap.get(day) || 0;

	return [day, numberOfBeersForDay / number];
})
.sort(sortTotalDesc)
.forEach(entry => console.log(entry.join(": ")));

console.log("\n");
console.log("Average beers per part of week");
Array.from(beersPerDayOfWeekMap)
.reduce(([weekdays, weekends], [day, number]): number[][]=> {
	const numberOfBeersForDay = beersPerDayOfWeekMap.get(day) || 0;
	const numberOfDays = dayOfWeekMap.get(day) || 0;
	const arr = ["Saturday", "Sunday"].includes(day) ? weekends : weekdays;

	arr[0] += numberOfBeersForDay;
	arr[1] += numberOfDays;

	return [weekdays, weekends];
}, [[0, 0], [0, 0]])
.map(([a, b], index)  : [string, number] => {
	return [index === 1 ? "Weekend" : "Weekday", a / b];
})
.sort(sortTotalDesc)
.forEach(entry => console.log(entry.join(": ")));


const daysWithoutABeer = dailyTotals.filter(total => !total);
const daysWithABeer = dailyTotals.filter(total => total > 0);

console.log("\n");
console.log("Total days recorded", dailyTotals.length);
console.log("Days without a beer:", daysWithoutABeer.length);
console.log("Days with a beer:", daysWithABeer.length);

console.log("Total beers:", sum(daysWithABeer));
console.log("Beers I've had more than once:", [...brewMap.values()].filter(v => v > 1).length);
console.log("Beers I've had more than twice:", [...brewMap.values()].filter(v => v > 2).length);
console.log("Total unique beers:", brewMap.size);
console.log("Total unique breweries:", breweryMap.size);
console.log("Total unique venues:", venueMap.size);
console.log("\n");
console.log("Average daily beers (all days):", sum(dailyTotals) / dailyTotals.length);
console.log("Average daily beers (non-dry days):", sum(daysWithABeer) / daysWithABeer.length);
console.log("Median daily beers (all days):", median(dailyTotals));
console.log("Median daily beers (non-dry days):", median(daysWithABeer));
console.log("Mode daily beers:", modeFast(dailyTotals));
console.log("Days with more beers than usual:", daysWithABeer.filter(total => total > median(dailyTotals)).length);
console.log("\n");
console.log("Longest streak (beers):", maxStreakBeers);
console.log("Longest streak (days):", maxStreakDays);
console.log("Longest dry spell (days):", maxDrought);

//console.log("daily aggregates", dailyTotals);
//console.log("weekly totals", weeklyTotals);
//console.log("monthly totals", monthlyTotals);
