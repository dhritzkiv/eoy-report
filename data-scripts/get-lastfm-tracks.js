"use strict";

const fs = require("fs");
const path = require("path");

const itunes = require("itunes-data");
const parser = itunes.parser();

const libraryPath = path.join(process.env.HOME, "Music/iTunes/iTunes Music Library.xml");
const readStream = fs.createReadStream(libraryPath);

const tracks = [];

parser.on("track", function(track) {
	if (track.Year === 2015) {
		tracks.push({
	    	name: track.Name,
	    	artist: track.Artist,
	    	album: track.Album,
	    	play_count: track['Play Count'] | 0,
	    	duration: track['Total Time'] | 0
    	});
	}
});

readStream.on('end', function() {
	tracks.sort((a, b) => b.play_count - a.play_count);
	console.log("top 10 tracks by play count:", tracks.slice(0, 10));
	
	const albumMap = tracks.reduce((map, track) => {
		
		const keyName = `${track.artist} - ${track.album}`;
		
		const prevCount = map.get(keyName) || 0;
		const count = prevCount + track.play_count;
		
		map.set(keyName, count);
		
		return map;
	}, new Map());
	
	console.log(Array.from(albumMap).sort((a, b) => b[1] - a[1]));
	
	const totalDuration = tracks
	.map(track => track.duration * track.play_count)
	.reduce((total, duration) => total + duration)
	
	console.log("total listening time", totalDuration);
});

readStream.pipe(parser);
