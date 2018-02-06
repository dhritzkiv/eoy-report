"use strict";

import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import { IncrementalMap } from "./utils";
import * as musicbrainz from "musicbrainz";
import { promisify } from "util";

const args = minimist(process.argv.slice(2));
const {_: [inFile, outFile]} = args;

assert.ok(inFile, "Missing input file argument");
assert.ok(outFile, "Missing output file argument");

interface CleanedTrack {
	name: string;
	album: string;
	artist: string;
	timestamp: number;
}

interface CleanedTrackInfo {
	name: string;
	duration: number;
}

interface CleanedAlbumInfo {
	album: string;
	artist: string;
	tracks: CleanedTrackInfo[]
}

const writePath = path.resolve(process.cwd(), outFile);
const allTracks: CleanedTrack[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), inFile), "utf8"));

let cache: CleanedTrackInfo[] = [];

try {
	cache.push(...JSON.parse(fs.readFileSync(path.join(process.cwd(), outFile), "utf8")));
} catch (e) {}

const asyncWriteFile = promisify(fs.writeFile);
const asyncSearchReleases = promisify(musicbrainz.searchReleases.bind(musicbrainz));
const asyncLookupRelease = promisify(musicbrainz.lookupRelease.bind(musicbrainz));

const main = async () => {
	//const uniqueTracksMap = new Map<string, CleanedTrack>();
	const uniqueAlbumsMap = new Map<string, {album: string, artist: string}>();

	/*allTracks
	.map(track => ({key: `${track.name}_${track.album}_${track.artist}`, value: track}))
	.forEach(({key, value}) => {
		if (!uniqueTracksMap.has(key)) {
			uniqueTracksMap.set(key, value);
		}
	});*/

	allTracks
	.filter(track => track.album)
	.map(track => ({key: `${track.album}_${track.artist}`, value: track}))
	.forEach(({key, value}) => {
		if (!uniqueAlbumsMap.has(key)) {
			uniqueAlbumsMap.set(key, {album: value.album, artist: value.artist});
		}
	})

	const uniqueAlbums = [...uniqueAlbumsMap.values()];
	const uniqueAlbumsInfo: CleanedAlbumInfo[] = [];

	for (const album of uniqueAlbums) {

		let albumSearchResults;

		try {
			albumSearchResults = await asyncSearchReleases(album.album, {
				artist: album.artist,
			});
		} catch (e) {
			console.error(e);
			continue;
		}

		albumSearchResults
		.sort((a, b) => {
			if (a.status === "Official") {
				return -1
			} else {
				return 1;
			}
		})
		.sort((a, b) => {
			if (a.country === "XW") {
				return -1
			} else {
				return 1;
			}
		});

		const [albumSearchResult] = albumSearchResults;

		if (!albumSearchResult) {
			console.warn(`No results for "${album.album} – ${album.artist}"`);

			continue;
		}

		const albumResult = await asyncLookupRelease(albumSearchResult.id, ["recordings"]);

		const [mediumResult] = albumResult.mediums;

		if (!mediumResult) {
			console.warn(`No results for "${album.album} – ${album.artist}"`);

			continue;
		}

		const tracks: CleanedTrackInfo[] = mediumResult.tracks.map(track => ({
			name: track.name,
			duration: track.length
		}));

		uniqueAlbumsInfo.push({
			artist: album.artist,
			album: album.album,
			tracks
		});

		console.log("%d: got %s by %s, with %d tracks", uniqueAlbumsInfo.length, album.album, album.artist, tracks.length);
	}

	const data = JSON.stringify(uniqueAlbumsInfo, null, "\t");

	await asyncWriteFile(outFile, data);
};

main();
