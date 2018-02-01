"use strict";

import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import * as moment from "moment";
import { IncrementalMap } from "./utils";
import * as LastFMAPI from "lastfmapi";
import { promisify } from "util";

const args = minimist(process.argv.slice(2));
const {_: [outFile], c: configPath = "../../data/lastfm_config.json", year = (new Date().getFullYear())} = args;

assert.ok(outFile, "Missing output file argument");

const writePath = path.join(process.cwd(), outFile);
const lastFMConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, configPath), "utf8"));
const lastfm = new LastFMAPI(lastFMConfig);

const asyncWriteFile = promisify(fs.writeFile);
const asyncGetRecentTracks = promisify(lastfm.user.getRecentTracks.bind(lastfm.user));

const startDate = moment("2017-01-01").startOf("year");
const endDate = startDate.clone().endOf("year");

interface LastFMArtist {
	"#text": string;
	mbid: string;
}

interface LastFMAlbum {
	"#text": string;
	mbid: string;
}

interface LastFMTrack {
	name: string;
	url: string;
	album: LastFMAlbum;
	artist: LastFMArtist;
	date: {
		uts: string
	}
}

interface CleanedTrack {
	name: string;
	album: string;
	artist: string;
	timestamp: number;
}

const main = async () => {
	const fromTimestamp = startDate.unix();
	const endTimestamp = endDate.unix();
	const allTracks: CleanedTrack[] = [];
	let page = 1;

	while (true) {
		const results = await asyncGetRecentTracks({
			user: "kmkldude",
			from: fromTimestamp,
			to: endTimestamp,
			limit: 200,
			page
		});

		console.log("got page %d", page);

		const pageTracks: LastFMTrack[] = results.track;

		allTracks.push(...pageTracks.map(item => ({
			name: item.name,
			timestamp: Number(item.date.uts),
			album: item.album["#text"],
			artist: item.artist["#text"]
		})));

		if (!pageTracks.length || page >= parseInt(results["@attr"].totalPages, 10)){
			break;
		}

		page++;
	}

	const data = JSON.stringify(allTracks, null, "\t");

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
