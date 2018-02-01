"use strict";

import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import { IncrementalMap } from "./utils";
import * as LastFMAPI from "lastfmapi";
import { promisify } from "util";

const args = minimist(process.argv.slice(2));
const {_: [inFile, outFile], c: configPath = "../../data/lastfm_config.json"} = args;

assert.ok(inFile, "Missing input file argument");
assert.ok(outFile, "Missing output file argument");

interface CleanedTrack {
	name: string;
	album: string;
	artist: string;
	timestamp: number;
}

interface LastFMArtist {
	name: string;
	mbid: string;
	url: string;
}

interface LastFMAlbum {
	title: string;
	artist: string;
	url: string;
}

interface LastFMTrackInfo {
	name: string;
	url: string;
	duration: string;
	artist: LastFMArtist;
	album?: LastFMAlbum
}

interface CleanedTrackInfo {
	name: string;
	album: string;
	artist: string;
	duration: number;
}

const writePath = path.resolve(process.cwd(), outFile);
const allTracks: CleanedTrack[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), inFile), "utf8"));
const lastFMConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, configPath), "utf8"));
const lastfm = new LastFMAPI(lastFMConfig);

const asyncWriteFile = promisify(fs.writeFile);
const asyncGetTrackInfo = promisify(lastfm.track.getInfo.bind(lastfm.track));

const main = async () => {
	const uniqueTracksMap = new Map<string, CleanedTrack>();

	allTracks
	.map(track => ({key: `${track.name}_${track.album}_${track.artist}`, value: track}))
	.forEach(({key, value}) => {
		if (!uniqueTracksMap.has(key)) {
			uniqueTracksMap.set(key, value);
		}
	});

	const uniqueTracks = [...uniqueTracksMap.values()];
	const uniqueTracksInfo: CleanedTrackInfo[] = [];

	for (const track of uniqueTracks) {
		const trackInfo: LastFMTrackInfo = await asyncGetTrackInfo({
			track: track.name,
			artist: track.artist,
			autocorrect: 1
		});

		uniqueTracksInfo.push({
			name: trackInfo.name,
			artist: track.artist,
			album: track.album,
			duration: parseInt(trackInfo.duration, 10)
		});

		console.log("%d: got %s by %s", uniqueTracksInfo.length, track.name, track.artist);
	}

	const data = JSON.stringify(uniqueTracksInfo, null, "\t");

	await asyncWriteFile(outFile, data);
};

main();



	/*const totalPlayCount = tracks.reduce((total, track) => total + track.playcount, 0);

	console.log("totalPlayCount", totalPlayCount);

	console.time("get info");

	async.mapSeries(tracks, (track, callback) => {

		const params = {};

		if (track.mbid) {
			params.mbid = track.mbid;
		} else {
			params.track = track.name;
			params.artist = track.artist;
		}

		lastfm.track.getInfo(params, (err, trackInfo) => {

			if (err) {
				err.message += `: ${track.artist} - ${track.name} (${track.mbid})`;
				console.error(err);

				return callback(null, track);
			}

			track.duration = trackInfo.duration | 0;//in ms
			track.album = trackInfo.album && trackInfo.album.title ? trackInfo.album.title : null;
			callback(null, track);
		});

	}, (err, tracks) => {

		console.timeEnd("get info");

		if (err) {
			return console.error(err);
		}

		fs.writeFileSync(writePath, JSON.stringify(tracks, null, "\t"), "utf8");
	});*/

	/*{ artist: [Object],
	   name: 'In the Hospital',
	   mbid: '36ad073b-3131-4a76-b4a7-ff8882620aba',
	   playcount: '1',
	   image: [Object],
	   url: 'http://www.last.fm/music/Friendly+Fires/_/In+the+Hospital',
	   '@attr': [Object] }*/
