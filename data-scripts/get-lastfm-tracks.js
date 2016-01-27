"use strict";

const fs = require("fs");
const path = require("path");

const async = require("async");
const LastfmAPI = require("lastfmapi");
const config = require(path.join(process.cwd(), "data", "lastfm_config.json"));

const lastfm = new LastfmAPI(config);

const writePath = path.join(process.cwd(), "data", "lastfm_tracks.json");

lastfm.user.getWeeklyTrackChart({
	user: "kmkldude",
	from: new Date(2015,0,1).getTime() / 1000,
	//to: new Date(2015,1,1).getTime()/1000,
	to: new Date(2015,11,31,23,59,59).getTime() / 1000
}, function (err, weeklyTrackChart) {
	
	if (err) {
		return console.error(err);
	}
	
	const tracks = weeklyTrackChart.track.map(item => ({
		name: item.name,
		playcount: item.playcount | 0,
		mbid: item.mbid,
		artist: item.artist['#text']
	}));
	
	const totalPlayCount = tracks.reduce((total, track) => total + track.playcount, 0);
	console.log("totalPlayCount", totalPlayCount);
	
	console.time("get info");
	
	async.mapSeries(tracks, function(track, callback) {
		
		const params = {};
		
		if (track.mbid) {
			params.mbid = track.mbid;
		} else {
			params.track = track.name;
			params.artist = track.artist;
		}
		
		lastfm.track.getInfo(params, function(err, trackInfo) {
			
			if (err) {
				err.message += `: ${track.artist} - ${track.name} (${track.mbid})`;
				console.error(err);
				return callback(null, track);
			}
			
			track.duration = trackInfo.duration | 0;//in ms
			track.album = trackInfo.album && trackInfo.album.title ? trackInfo.album.title : null;
			callback(null, track);
		});
		
	}, function(err, tracks) {
		
		console.timeEnd("get info");
		
		if (err) {
			return console.error(err);
		}
		
		fs.writeFileSync(writePath, JSON.stringify(tracks, null, "\t"), "utf8");
	});
	
	 /*{ artist: [Object],
       name: 'In the Hospital',
       mbid: '36ad073b-3131-4a76-b4a7-ff8882620aba',
       playcount: '1',
       image: [Object],
       url: 'http://www.last.fm/music/Friendly+Fires/_/In+the+Hospital',
       '@attr': [Object] }*/
	
});