"use strict";

const path = require("path");
const fs = require("fs");
const moment = require("moment");

const args = process.argv.slice(2);
const [dataFile] = args;

/*
{
	beer_name: 'NIGHT TRAIN DARK ALE',
	brewery_name: 'Junction Craft Brewing',
	beer_type: 'Dark Ale',
	beer_abv: '4',
	beer_ibu: '50',
	comment: '',
	venue_name: 'The Dock Ellis',
	venue_city: 'Toronto',
	venue_state: 'ON',
	venue_country: 'Canada',
	venue_lat: '43.6494',
	venue_lng: '-79.4254',
	rating_score: '3.5',
	created_at: '2016-01-02 23:27:49',
	checkin_url: 'https://untappd.com/c/263505014',
	beer_url: 'https://untappd.com/beer/303188',
	brewery_url: 'https://untappd.com/brewery/15460',
	brewery_country: 'Canada',
	brewery_city: 'Toronto',
	brewery_state: 'ON'
 }
*/

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
const DAYS_IN_2016 = 366;

const leftPad = (digit, length) => {
	const padding = Array(length - digit.toString().length).fill(" ").join("");

	return `${padding}${digit}`.slice(-length);
};

const consoleOutListRow = (key, value, array) => {
	const leftPaddedValue = leftPad(value, array[0][1].toString().length);

	console.log(`${leftPaddedValue} - ${key}`)
};

const topTenFromTallyMap = (tallyMap) => [...tallyMap]
.sort(([, a], [, b]) => b - a)
.slice(0, 10);

const startOfDayDate = (date_string) => moment(date_string).startOf('day').toDate();

const data = fs.readFileSync(path.join(process.cwd(), dataFile), "utf8");

const checkins = JSON.parse(data);
const currentYearCheckins = checkins.filter(({created_at}) => startOfDayDate(created_at).getFullYear() === 2016);

const uniqueBeers = new Map();
const uniqueBreweries = new Map();
const tallyStyles = new Map();
const tallyBeers = new Map();
const tallyBreweries = new Map();
const tallyCountries = new Map();
const tallyCities = new Map();
const tallyVenues = new Map();
const drinkingDays = new Set();

let longestBeerStreakDays = 0;
let currentBeerStreakDays = 0;
let longestBeerStreakBeers = 0;
let currentBeerStreakBeers = 0;
let longestDrySpell = 0;
let currentDrySpell = 0;

currentYearCheckins
.sort(({created_at: a}, {created_at: b}) => new Date(a) - new Date(b))
.forEach((checkin, index) => {
	const previousCheckin = currentYearCheckins[index - 1] || null;
	const beerId = checkin.beer_url.slice(checkin.beer_url.lastIndexOf("/") + 1);
	const breweryId = checkin.brewery_url.slice(checkin.beer_url.lastIndexOf("/") + 1);
	const checkinDate = startOfDayDate(checkin.created_at);

	drinkingDays.add(moment(checkinDate).valueOf().toString());

	if (previousCheckin) {
		const previousCheckinDate = startOfDayDate(previousCheckin.created_at);
		const dayDiff = moment(checkinDate).diff(moment(previousCheckinDate), "days");

		currentBeerStreakBeers++;

		//multiple beers on the same date.
		if (dayDiff === 1) {
			currentBeerStreakDays++;
		} else if (dayDiff > 1) {
			currentBeerStreakDays = 1;
			currentBeerStreakBeers = 1;
			currentDrySpell = dayDiff;
		}

	} else {
		currentBeerStreakDays++;
		longestBeerStreakDays++;
		currentBeerStreakBeers++;
		longestBeerStreakBeers++;

		currentDrySpell = moment(checkinDate).diff(moment(new Date(2016, 0)), "days");
	}

	longestBeerStreakDays = Math.max(currentBeerStreakDays, longestBeerStreakDays);
	longestBeerStreakBeers = Math.max(currentBeerStreakBeers, longestBeerStreakBeers);
	longestDrySpell = Math.max(currentDrySpell, longestDrySpell);

	let beerInUniqueMap = uniqueBeers.get(beerId);

	if (!beerInUniqueMap) {
		beerInUniqueMap = checkin;
		uniqueBeers.set(beerId, checkin);
	}

	const beerCountInTallyMap = tallyBeers.get(beerInUniqueMap);

	tallyBeers.set(beerInUniqueMap, (beerCountInTallyMap || 0) + 1);

	let breweryInUniqueMap = uniqueBreweries.get(breweryId);

	if (!breweryInUniqueMap) {
		breweryInUniqueMap = {
			brewery_name: checkin.brewery_name,
			brewery_country: checkin.brewery_country,
			brewery_state: checkin.brewery_state,
			brewery_city: checkin.brewery_city
		};

		uniqueBreweries.set(breweryId, breweryInUniqueMap);
	}

	const breweryCountInTallyMap = tallyBreweries.get(breweryInUniqueMap) || 0;

	tallyBreweries.set(breweryInUniqueMap, breweryCountInTallyMap + 1);

	const countryCountInTallyMap = tallyCountries.get(checkin.brewery_country) || 0;

	tallyCountries.set(checkin.brewery_country, countryCountInTallyMap + 1);

	const cityKey = [checkin.brewery_city, checkin.brewery_state].filter(e => e).join(" ");
	const cityCountInTallyMap = tallyCities.get(cityKey) || 0;

	tallyCities.set(cityKey, cityCountInTallyMap + 1);

	if (typeof checkin.venue_name === "string") {
		const venueCountInTallyMap = tallyVenues.get(checkin.venue_name) || 0;

		tallyVenues.set(checkin.venue_name, venueCountInTallyMap + 1);
	}

	const styleCountInTallyMap = tallyStyles.get(checkin.beer_type) || 0;

	tallyStyles.set(checkin.beer_type, styleCountInTallyMap + 1);
});

const topTenBeers = topTenFromTallyMap(tallyBeers);
const topTenBreweries = topTenFromTallyMap(tallyBreweries);
const topTenCountries = topTenFromTallyMap(tallyCountries);
const topTenCities = topTenFromTallyMap(tallyCities);
const topTenVenues = topTenFromTallyMap(tallyVenues);
const topTenStyles = topTenFromTallyMap(tallyStyles);

const canadianBreweries = [...uniqueBreweries.values()]
.filter(({brewery_country}) => brewery_country.toLowerCase() === "canada");

const ontarianBreweries = canadianBreweries
.filter(({brewery_state}) => brewery_state.toUpperCase() === "ON");

const torontonianBreweries = ontarianBreweries
.filter(({brewery_city}) => brewery_city.toLowerCase() === "toronto");

console.log("# of drinking days", drinkingDays.size);
console.log("# of non-drinking days", DAYS_IN_2016 - drinkingDays.size);
console.log("Longest beer streak (beers)", longestBeerStreakBeers);
console.log("Longest beer streak (days)", longestBeerStreakDays);
console.log("Longest dry spell (days)", longestDrySpell);
console.log("# of total beers", currentYearCheckins.length);
console.log("# of unique beers", uniqueBeers.size);
console.log("# of beers per day", uniqueBeers.size / DAYS_IN_2016);
console.log("# of unique breweries", uniqueBreweries.size);
console.log("# of unique countries", tallyCountries.size);
console.log("# of unique venues", tallyVenues.size);
console.log("# of Torontonian breweries", torontonianBreweries.length);
console.log("# of Ontarian breweries", ontarianBreweries.length);
console.log("# of Canadian breweries", canadianBreweries.length);

//top ten beers
console.log("\ntop ten beers");
topTenBeers.forEach(([{beer_name}, count]) => consoleOutListRow(beer_name, count, topTenBeers));

//top ten breweries
console.log("\ntop ten breweries");
topTenBreweries.forEach(([{brewery_name}, count]) => consoleOutListRow(brewery_name, count, topTenBreweries));

//top ten countries
console.log("\ntop ten countries");
topTenCountries.forEach(([country_name, count]) => consoleOutListRow(country_name, count, topTenCountries));

//top ten countries
console.log("\ntop ten cities");
topTenCities.forEach(([key, count]) => consoleOutListRow(key, count, topTenCities));

//top ten venues
console.log("\ntop ten venues");
topTenVenues.forEach(([key, count]) => consoleOutListRow(key, count, topTenVenues));

//top ten styles
console.log("\ntop ten styles");
topTenStyles.forEach(([key, count]) => consoleOutListRow(key, count, topTenStyles));
