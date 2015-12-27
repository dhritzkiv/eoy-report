"use strict";

const fs = require("fs");
const path = require("path");

const movesConfig = require(path.join(process.cwd(), "./data/moves_config.json"));

const Moves = require('moves-api');
const moves = new Moves.MovesApi(movesConfig);
const async = require('async');

//const rideIdsFilePath = "./data/2015_ride_ids.json";
//const ridesFilePath = "./data/2015_rides.json";

//const targetRideKeys = ["id", "name", "distance", "moving_time", "elapsed_time", "total_elevation_gain", "start_date_local", "gear_id", "average_speed", "max_speed", "average_watts", "calories"];

//return console.log(moves.generateAuthUrl(["activity", "location"]));

/*return moves.getAccessToken("", function(err, authData) {
	console.log(err || authData);
});*/

//getRideIdsFor2015();

function getTotalSteps() {
	
	const currentDatePlusOneMonth = new Date();
	currentDatePlusOneMonth.setMonth(currentDatePlusOneMonth.getMonth() + 1);
	
	async.timesSeries(12, function(monthNumber, next) {
		
		const monthDate = new Date(2015, monthNumber, 1);//despite JS months being 0-indexed, this isn't
		
		if (monthDate > currentDatePlusOneMonth) {
			return next(null, []);
		}
		
		moves.getSummaries({
			month: monthDate
		}, function(err, data) {
			
			if (err) {
				return next(err);
			}
						
			console.log("got month %d", monthNumber);
			
			const walks = data
			//a week may contain days from another year
			.filter(day => (day.date.substring(0, 4) | 0) >= 2015)
			//we only need summaries
			.map(day => day.summary)
			.filter(summaries => summaries)
			.map(
				summaries => summaries.filter(
					summary => summary.activity === "walking"
				)
			)
			//flatten array
			.reduce((a, b) => a.concat(b), [])
			//filter out any null segments
			/*.filter(seg => seg)
			//only include move activities
			.filter(seg => seg.type === "move")
			.map(seg => seg.activities)
			//activities can have multiple parts? 
			.reduce((a, b) => a.concat(b), [])	
			//only include walking activities (cycling is handled differently)
			.filter(activity => activity.activity === "walking")
			//we're only interested in the points
			.map(activity => activity.trackPoints)
			//format the point objects to [lon, lat] arrays
			.map(walks => walks.map(points => [points.lon, points.lat]))
			//each walk is an object to match other data structures
			.map(walks => ({points: walks}));*/
			
			next(null, walks);
		});
	}, function(err, months) {
		
		if (err) {
			return console.error(err);
		}
		
		const allDays = months.reduce((a, b) => a.concat(b), []);
			
		const walksJSON = JSON.stringify(allDays, null, "\t");
		
		fs.writeFileSync(path.join(process.cwd(), "data", "2015_walking-days.json"), walksJSON);
	});
}

getTotalSteps();

function getWalks() {

	async.timesSeries(52, function(weekNumber, next) {
		
		const dateInWeek = (1 + (7 * (weekNumber - 1)));
		const weekDate = new Date(2015, 0, dateInWeek);
		
		if (weekDate > new Date()) {
			return next(null, []);
		}
		
		moves.getStoryline({
			week: weekDate,
			trackPoints: true
		}, function(err, data) {
			
			if (err) {
				return next(err);
			}
			
			console.log("got week %d", weekNumber);
			
			const walks = data
			//a week may contain days from another year
			.filter(day => (day.date.substring(0, 4) | 0) === 2015)
			//we only need segments
			.map(day => day.segments)
			//days can be merged
			.reduce((a, b) => a.concat(b), [])
			//filter out any null segments
			.filter(seg => seg)
			//only include move activities
			.filter(seg => seg.type === "move")
			//return only activities
			.map(seg => seg.activities)
			//activities can have multiple parts? 
			.reduce((a, b) => a.concat(b), [])	
			//only include walking activities (cycling is handled differently)
			.filter(activity => activity.activity === "walking")
			//we're only interested in the points
			.map(activity => activity.trackPoints)
			//format the point objects to [lon, lat] arrays
			.map(walks => walks.map(
				points => [points.lon, points.lat]
			))
			//each walk is an object to match other data structures
			.map(walks => ({points: walks}));
			
			next(null, walks);
		});
	}, function(err, weeks) {
		
		if (err) {
			return console.error(err);
		}
		
		weeks = weeks.reduce((a, b) => a.concat(b), []);
			
		const walksJSON = JSON.stringify(weeks, null, "\t");
		
		fs.writeFileSync(path.join(process.cwd(), "data", "2015_walks.json"), walksJSON);
	});
}