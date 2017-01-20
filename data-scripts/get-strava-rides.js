"use strict";

const fs = require("fs");

const strava = require('strava-v3');
const async = require('async');
const polyline = require('polyline');

const rideIdsFilePath = "./data/2016_ride_ids.json";
const ridesFilePath = "./data/2016_rides.json";

const targetRideKeys = ["id", "name", "distance", "moving_time", "elapsed_time", "total_elevation_gain", "start_date_local", "average_speed", "max_speed", "calories"];

const padRec = (number, paddingNumber, length) => number.length >= length ? number : padRec(paddingNumber + number, paddingNumber, length);

const getRideIdsForYear = (year) => {
	const ride_ids = [];
	const startOfYear = new Date(year, 0, 1);
	const endOfYear = new Date(year, 11, 31, 23, 59, 59);
	let retrievalPage = 1;

	const testForYear = (ride) => (
		ride &&
		new Date(ride.start_date_local) > startOfYear &&
		new Date(ride.start_date_local) < endOfYear
	);

	async.doWhilst((callback) => {
		strava.athlete.listActivities({
			page: retrievalPage,
			per_page: 200
		}, (err, rides) => {

			if (err || !Array.isArray(rides)) {
				err = err || new Error("not an array");
				err.rides = rides;

				return callback(err);
			}

			const ids = rides
			.filter(testForYear)
			.map(({id}) => id);

			ride_ids.push(...ids);

			console.log("page %d; retrieved %d rides.", retrievalPage, ids.length);

			retrievalPage++;

			callback(null, rides);
		});
	}, (rides) => testForYear(rides[rides.length - 1]), (err) => {

		if (err) {
			return console.error(err);
		}

		const data = JSON.stringify(ride_ids, null, '\t');

		fs.writeFile(rideIdsFilePath, data, (err) => console.log(err || "done writing"));
    });
}

const simplifyRideData = (ride) => {
	const simple = {};

	targetRideKeys.forEach(key => simple[key] = ride[key]);

	if (ride.map && ride.map.polyline) {
		simple.points = polyline.decode(ride.map.polyline);
		//reverse order of coords
		simple.points = simple.points.map(point => point.reverse());
	}

	return simple;
}

const getRideById = (id, callback) => strava.activities.get({id}, (err, ride) => {

	if (err) {
		return callback(err);
	}

	if (ride.errors) {
		return callback(new Error(ride.message));
	}

	callback(null, simplifyRideData(ride));
});

const getRidesForYear = (offset = 0) => fs.readFile(rideIdsFilePath, "utf8", (err, data) => {

	if (err) {
		throw err;
	}

	let lastFetch = Date.now();
	const ride_ids = JSON.parse(data).slice(offset);
	const rides = [];

	async.eachOfLimit(ride_ids, 4, (ride_id, index, callback) => {
		lastFetch = new Date();

		getRideById(ride_id, (err, ride) => {

			if (err) {
				return callback(err);
			}

			index = padRec(index.toString(), "0", ride_ids.length.toString().length);

			let logLine = `#${index} [${(new Date()).toLocaleTimeString()}]: `;

			logLine += `Parsed "${ride.name}" (${(new Date(ride.start_date_local)).toLocaleDateString()})`;

			if (ride.points) {
				logLine += ` with ${ride.points.length} points`;
			}

			console.log(logLine);

			rides.push(ride);

			//wait at most 1s between fetches.
			setTimeout(callback, Math.max((lastFetch + 250) - Date.now(), 0));
		});
	}, (err) => {

		if (err) {
			console.error(err);
		}

		const ridesJSON = JSON.stringify(rides, null, '\t');

		fs.writeFile(ridesFilePath, ridesJSON, "utf8", (err) => console.log(err || "Done writing"));
	});
});

//getRideIdsForYear(2016);

getRidesForYear(599);
