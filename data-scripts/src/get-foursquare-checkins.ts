"use strict";

import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
import * as minimist from "minimist";
import * as moment from "moment";
import { IncrementalMap, SimpleFoursquareCheckin as SimpleCheckin} from "./utils";
import * as Foursquare from "node-foursquare";

const {_: [outFile], c: configPath, year: yearString} = minimist(process.argv.slice(2));

assert(outFile, "output file not specified");
assert(configPath, "config not specified");

const year = parseInt(yearString);

assert.equal(typeof year, "number");
assert(Number.isFinite(year));

const configRaw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configRaw);
const foursquare = Foursquare(config);

interface RawVenue {
	id: string;
	name: string;
	categories: {name: string}[];
	location: {lng: number, lat: number, cc: string, city: string, state: string}
}

interface RawCheckin {
	venue: RawVenue;
	createdAt: number;
	with?: {firstName: string}[];
}

interface RawCheckinResponse {
	checkins: {items: RawCheckin[]};
}

const asyncGetCheckins = (opts) => new Promise<RawCheckinResponse>((resolve, reject) => {
	foursquare.Users.getCheckins(null, opts, config.secrets.accessToken, (err, data: RawCheckinResponse) => {
		if (err) {
			return reject(err);
		}

		resolve(data);
	});
});

const getCheckinsForYear = async () => {
	const firstDateInYear = new Date(year, 0, 1, 0, 0, 0, 0); //Jan 1, <year>
	const lastDateInYear = new Date(year, 11, 31, 23, 59, 59);
	const limit = 250;//maximum;
	let offset = 0;
	let isDone = false;
	const checkins: SimpleCheckin[] = [];

	const formatCheckinVenue = (checkin: RawCheckin): SimpleCheckin => ({
		venue_id: checkin.venue.id,
		venue_name: checkin.venue.name,
		venue_categories: checkin.venue.categories.map(cat => cat.name),
		date: new Date(checkin.createdAt * 1000),//first date
		venue_location: {
			lng: checkin.venue.location.lng,
			lat: checkin.venue.location.lat
		},
		venue_cc: checkin.venue.location.cc,
		venue_city: checkin.venue.location.city,
		venue_state: checkin.venue.location.state,
		with: checkin.with ? checkin.with.map(w => w.firstName) : undefined
	});

	while (!isDone) {
		const data = await asyncGetCheckins({
			limit,
			offset,
			sort: "newestfirst",
			beforeTimestamp: lastDateInYear.getTime() / 1000
		});

		const theseCheckins = data.checkins.items
		.map(formatCheckinVenue)
		.filter(checkin => checkin.date <= lastDateInYear && checkin.date >= firstDateInYear);

		console.log(`got ${theseCheckins.length} checkins. offset is ${offset}`);

		offset += limit;

		checkins.push(...theseCheckins);

		if (theseCheckins.length < limit) {
			isDone = true;
		}
	}

	checkins.sort(({date: a}, {date: b}) => a.getTime() - b.getTime());

	fs.writeFileSync(outFile, JSON.stringify(checkins, null, "\t"));
};

getCheckinsForYear();
