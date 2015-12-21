"use strict";

const path = require("path");
const fs = require("fs");

const config = require(path.join(process.cwd(), "data", "foursquare_config.json"));
const checkinsWritePath = path.join(process.cwd(), "data", "2015_foursquare-checkins.json");

const foursquare = require('node-foursquare')(config);
const async = require("async");

//console.log(foursquare.getAuthClientRedirectUrl());

/*foursquare.getAccessToken({
    code: "",
  }, function (error, accessToken) {
if(error) {
  res.send('An error was thrown: ' + error.message);
}
else {
  // Save the accessToken and redirect.
  console.log(accessToken);
}
});*/

function getCheckinsFor2015() {
	
	const limit = 250;//maximum;
	let offset = 0;
	let isDone = false;
	
	const checkins2015Map = new Map();
	
	function formatCheckinVenue(checkin) {
		return {
			id: checkin.venue.id,
			name: checkin.venue.name,
			date: new Date(checkin.createdAt * 1000),
			point: [checkin.venue.location.lng, checkin.venue.location.lat]
		}
	}

	async.doWhilst(function (callback) {
		
		foursquare.Users.getCheckins(null, {
			limit: limit,
			offset: offset,
			sort: "oldestfirst",
			afterTimestamp: 1420088400//Jan 1, 2015
		}, config.secrets.accessToken, function(err, data) {
			
			if (err) {
				return callback(err);
			}
			
			const checkins = data.checkins.items.map(formatCheckinVenue);
			
			console.log(`got ${checkins.length} checkins. offset is ${offset}`);
			
			offset += limit;
			
			if (!checkins.length) {
				isDone = true;
				return callback();
			}
			
			checkins.forEach(checkin => checkins2015Map.set(checkin.id, checkin));
			
			callback();
		});
	}, () => !isDone, function (err) {
	    
	    if (err) {
	        return console.error(err);
	    }
	    
	    const checkins2015Array = Array.from(checkins2015Map.values());
	    
	    fs.writeFile(checkinsWritePath, JSON.stringify(checkins2015Array, null, '\t'), function(err) {
	        console.log(err || "done writing");
	    });
	});	
}

getCheckinsFor2015();