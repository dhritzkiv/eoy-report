"use strict";

const fs = require("fs");

const strava = require('strava-v3');
const async = require('async');
const polyline = require('polyline');

const rideIdsFilePath = "./data/2015_ride_ids.json";
const ridesFilePath = "./data/2015_rides.json";

const targetRideKeys = ["id", "name", "distance", "moving_time", "elapsed_time", "total_elevation_gain", "start_date_local", "gear_id", "average_speed", "max_speed", "average_watts", "calories"];

function getRideIdsFor2015() {
	const ride_ids = [];
	const startOf2015 = new Date(2015, 0, 1);
	
	let retrievalPage = 1;
	let latestRide = null;
	
	const testFor2015 = (ride) => ride && new Date(ride.start_date_local) > startOf2015;
	
	async.doWhilst(function (callback) {
        strava.athlete.listActivities({
	        page: retrievalPage,
			per_page: 200
		}, function(err, rides) {
			
			if (err || !Array.isArray(rides)) {
				err = err || new Error("not an array");
				err.rides = rides;
				return callback(err);
			}
			
			console.log("page %d; retrieved %d rides.", retrievalPage, rides.length);
			
			latestRide = rides[rides.length - 1];
			
			rides = rides.filter(testFor2015);
			rides.forEach(ride => ride_ids.push(ride.id));
			
			retrievalPage++
			callback();
		});
    }, () => testFor2015(latestRide), function (err) {
	    
        if (err) {
	        return console.error(err);
        }
        
        fs.writeFile(rideIdsFile, JSON.stringify(rideIdsFilePath, null, '\t'), function(err) {
	        console.log(err || "done writing");
        });
    });
}

//getRideIdsFor2015();

function simplifyRideData(ride) {
	const simple = {};
	
	targetRideKeys.forEach(key => simple[key] = ride[key]);
	
	simple.points = polyline.decode(ride.map.polyline);
	//reverse order of coords
	simple.points = simple.points.map(point => point.reverse())
	
	return simple;
}

function getRideById(id, callback) {
	strava.activities.get({id: id}, function(err, ride) {
		
		if (err) {
			return callback(err);
		}
		
		callback(null, simplifyRideData(ride));
	});
}

function getRidesFor2015() {
	
	function padRec(number, paddingNumber, length) {
		return number.length >= length ? number : padRec(paddingNumber + number, paddingNumber, length);
    }
	
	fs.readFile(rideIdsFilePath, "utf8", function(err, data) {
		
		if (err) {
			throw err;
		}
		
		let lastFetch = Date.now();
		const ride_ids = JSON.parse(data);
		const writeStream = fs.createWriteStream(ridesFilePath);
		
		writeStream.write("[", "utf8");
		
		async.eachSeries(ride_ids, function(ride_id, callback) {
			lastFetch = new Date();
			
			getRideById(ride_id, function(err, ride) {
				
				if (err) {
					return callback(err);
				}
				
				let index = ride_ids.indexOf(ride_id);
				index = padRec(index.toString(), "0", ride_ids.length.toString().length);
				
				console.log(`#${index} [${(new Date()).toLocaleTimeString()}]: Parsed "${ride.name}" (${(new Date(ride.start_date_local)).toLocaleDateString()}) with ${ride.points.length} points`);
				
				const rideJSON = JSON.stringify(ride, null, '\t');
				writeStream.write(rideJSON, "utf8", function(err) {
					if (err) {
						return callback(err);
					}
					
					//wait at most 1s between fetches.
					setTimeout(callback, Math.max((lastFetch + 1000) - Date.now(), 0));
				});
			});
		}, function(err) {
			if (err) {
				console.error(err);
			}
			
			writeStream.end("]", "utf8");
		});
	});
}

getRidesFor2015();