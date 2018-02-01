import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import {quantile, median, mean, max, min, sum, modeFast as mode, standardDeviation} from "simple-statistics";
import * as moment from "moment";
import {IncrementalMap} from "./utils";

interface Track {
	name: string;
	album: string;
	artist: string;
	timestamp: number;
}

interface TrackInfo {
	name: string;
	album: string;
	artist: string;
	duration: number;
}

class NumberArray extends Array<number> {}

interface NumberTuple extends NumberArray { 0: number; 1: number; }

class NumberMap extends Map<number, number> {
	constructor(entries?: NumberTuple[]) {
		super(entries);
	}
}

const sortTotalDesc = ([, a]: [any, number], [, b]: [any, number]) => b - a;
const colonJoiner = arr => arr.join(": ");
const logEachInOrderedList = (item, index) => console.log(`${index + 1}. ${item.join(": ")}`);

const isWeekend = (date: moment.Moment) => date.weekday() === 0 || date.weekday() === 6;

const calculateStreaksForData = (data: number[]) => {
	let streakDays = 0;
	let streakListens = 0;
	let drySpell = 0;
	let maxStreakDays = 0;
	let maxStreakListens = 0;
	let maxDrySpell = 0;

	data
	.forEach(value => {
		if (value !== 0) {
			drySpell = 0;
			streakDays++;
			streakListens += value;
		} else {
			drySpell++;
			streakDays = 0;
			streakListens = 0;
		}

		maxStreakDays = Math.max(maxStreakDays, streakDays);
		maxStreakListens = Math.max(maxStreakListens, streakListens);
		maxDrySpell = Math.max(maxDrySpell, drySpell);
	});

	return {
		maxStreakDays,
		maxStreakListens,
		maxDrySpell
	};
};

const {_: [inFile, trackInfoFile]}: {_: [string, string]} = minimist(process.argv.slice(2));

assert.ok(inFile, "Missing input file argument");
assert.ok(trackInfoFile, "Missing track info file");

const tracksRaw = fs.readFileSync(inFile, "utf8");
const trackInfoRaw = fs.readFileSync(trackInfoFile, "utf8");
const data: Track[] = JSON.parse(tracksRaw);
const trackInfoData: TrackInfo[] = JSON.parse(trackInfoRaw);

assert.ok(Array.isArray(data), "Data is not an array");
assert.ok(Array.isArray(trackInfoData), "Track data is not an array");

const trackInfoMap = new Map<string, TrackInfo>();

trackInfoData.forEach(info => trackInfoMap.set(`${info.name}|${info.album}|${info.artist}`, info));

class Track implements Track {
	date: moment.Moment;
	info: TrackInfo;

	constructor(opts: Track) {
		this.name = opts.name;
		this.album = opts.album;
		this.artist = opts.artist;
		this.timestamp = opts.timestamp;
		this.date = moment.unix(this.timestamp);

		this.getTrackInfo();
	}

	getTrackInfo() {
		const info = trackInfoMap.get(`${this.name}|${this.album}|${this.artist}`);

		if (!info) {
			console.warn("No info for ${this.name} - ${this.artist}");
		} else {
			this.info = info;
		}
	}

	get albumId() {
		return `${this.album}|${this.artist}`;
	}

	get trackId() {
		return `${this.name}|${this.albumId}`
	}

	get duration() {
		return this.info.duration;
	}
}

const listens = data.map(d => new Track(d));

listens.sort(({date: a}, {date: b}) => a.diff(b, "ms"));

const startTime = listens[0].date.clone().startOf("year");
const endTime = listens[listens.length - 1].date.clone().endOf("year");
const daysInYear = endTime.diff(startTime, "days");

const dailyListenCountsMap = new IncrementalMap<number>();
const dailyDurationsMap = new IncrementalMap<number>();
const dayOfWeekCountMap = new IncrementalMap<string>();
const monthCountMap = new IncrementalMap<string>();

for (let i = 0; i < daysInYear; i++) {
	const day = moment(startTime).add(i, "days");
	const dayOfWeekKey = day.format("dddd");

	dayOfWeekCountMap.increment(dayOfWeekKey);
	dailyListenCountsMap.set(i + 1, 0);
	dailyDurationsMap.set(i + 1, 0);
}

const getListensByDayOfWeek = (data: Track[]) => {
	//create a new Map for holding values for each day of the week; fill it with empty data
	const days = new IncrementalMap<number>();

	data
	.map(({date, name}) => ({day: date.day(), name}))
	.forEach(({day, name}) => days.increment(day));

	return [...days];
};

const listensByDayOfWeekSorted = getListensByDayOfWeek(listens)
.map(([day, value]): [string, number] => [moment().day(day).format("dddd"), value])
.sort(([, a], [, b]) => b - a);

console.log();
console.group("Listens by day of week");
listensByDayOfWeekSorted
.forEach(([day, val]) => console.log(`${day}: ${val}`));
console.groupEnd();

console.log();
console.group("Average listens by day of week");
listensByDayOfWeekSorted
.map(([day, val]) => [day, val / (dayOfWeekCountMap.get(day) || 1)])
.forEach(([day, val]) => console.log(`${day}: ${val}`));
console.groupEnd();

const weeksMap = new IncrementalMap<string>();
const weeksDurationMap = new IncrementalMap<string>();
const monthsMap = new IncrementalMap<number>();
const monthsDurationMap = new IncrementalMap<number>();
const dayOfWeekDurationMap = new IncrementalMap<string>();

const uniqueTracksSet = new Set<Track["trackId"]>();
const uniqueAlbumsSet = new Set<Track["albumId"]>();
const uniqueAristsSet = new Set<Track["artist"]>();

const tracksMap = new IncrementalMap<Track["trackId"]>();
const albumsMap = new IncrementalMap<Track["albumId"]>();
const artistsMap = new IncrementalMap<Track["artist"]>();

listens.forEach(track => {
	const dayOfYearKey = track.date.dayOfYear();
	const dayOfWeekKey = track.date.format("dddd");
	const weekKey = track.date.format("YYYY-w");
	const monthKey = track.date.month();

	dailyListenCountsMap.increment(dayOfYearKey);
	dailyDurationsMap.increment(dayOfYearKey, track.duration);

	dayOfWeekDurationMap.increment(dayOfWeekKey, track.duration);
	weeksMap.increment(weekKey);
	weeksDurationMap.increment(weekKey, track.duration);
	monthsMap.increment(monthKey);
	monthsDurationMap.increment(monthKey, track.duration);

	tracksMap.increment(track.trackId);
	uniqueTracksSet.add(track.trackId.toLowerCase());

	if (track.album) {
		uniqueAlbumsSet.add(track.albumId.toLowerCase());
		albumsMap.increment(track.albumId.toLowerCase());
	}

	if (track.artist) {
		uniqueAristsSet.add(track.artist.toLowerCase());
		artistsMap.increment(track.artist.toLowerCase());
	}
});

console.log("\n");
console.group("Top 50 Tracks");
Array.from(tracksMap)
.sort(sortTotalDesc)
.slice(0, 50)
.map(([name, val]) => [name.split("|").join(" – "), val])
.forEach(logEachInOrderedList);
console.groupEnd()

console.log("\n");
console.group("Top 50 Albums");
Array.from(albumsMap)
.sort(sortTotalDesc)
.slice(0, 50)
.map(([name, val]) => [name.split("|").join(" – "), val])
.forEach(logEachInOrderedList);
console.groupEnd();

console.log("\n");
console.group("Top 50 Artists");
Array.from(artistsMap)
.sort(sortTotalDesc)
.slice(0, 50)
.forEach(logEachInOrderedList);
console.groupEnd();

console.log();
console.group("Average listen duration per day of week");
[...dayOfWeekDurationMap]
.map(([day, count]): [string, number] => [day, count / (dayOfWeekCountMap.get(day) || 1)])
.sort(([, a], [, b]) => b - a)
.forEach(([day, average]) => console.log(`${day}: ${moment.duration(average, "ms").asMinutes()} mins.`));
console.groupEnd();

/*
console.log();
console.log("Listens by week:", [...weeksMap.values()]);
console.log("Listen duration by week:", [...weeksDurationMap.values()].map(d => d / 1000));
*/

console.log();
console.group("Listens by month");
[...monthsMap].forEach(([month, value]) => console.log(`${month}: ${value}`));
console.groupEnd();

console.group("Duration by month");
[...monthsDurationMap].forEach(([month, value]) => console.log(`${month}: ${moment.duration(value, "ms").asHours()} hours`));
console.groupEnd();

const dailyListenCountValues = [...dailyListenCountsMap.values()];
const dailyDurationValues = [...dailyDurationsMap.values()];
const trackListenCountValues = [...tracksMap.values()];
const albumListenCountValues = [...albumsMap.values()];
const artistListenCountValues = [...artistsMap.values()];

const {
	maxStreakDays: totalMaxStreakDays,
	maxStreakListens: totalMaxStreakListens,
	maxDrySpell: totalMaxDrySpell
} = calculateStreaksForData(dailyListenCountValues);

const listenDurations = listens.map(listen => listen.duration);

console.log();
console.group("Basic stats by track");
console.log("total tracks listened: %d", listens.length);

const averageDailyTrackListenCount = mean(dailyListenCountValues);
const medianDailyTrackListenCount = median(dailyListenCountValues);
console.log("Average daily track listens: %d", averageDailyTrackListenCount);
console.log("Median daily track listens: %d", medianDailyTrackListenCount);
console.log("Most daily track listens: %d", max(dailyListenCountValues));
//console.log("Least daily track listens: %d", min(dailyListenCountValues));

console.log("Average daily listen duration: %d", moment.duration(mean(dailyDurationValues), "ms").asMinutes());
console.log("Median daily listen duration: %d", moment.duration(median(dailyDurationValues), "ms").asMinutes());
console.log("Most daily listen duration: %d", moment.duration(max(dailyDurationValues), "ms").asMinutes());

console.log("Total listening time: %fh", moment.duration(sum(listenDurations), "ms").asHours());
console.log("Average listen duration: %fm", moment.duration(mean(listenDurations), "ms").asMinutes());
console.log("Median listen duration: %fm", moment.duration(median(listenDurations), "ms").asMinutes());

console.log("Days without listening to music: %d", dailyListenCountValues.filter(v => !v).length);
console.log("Days listening to more music than average: %d", dailyListenCountValues.filter(v => v > averageDailyTrackListenCount).length);

console.log("Average track listen count: %d", mean(trackListenCountValues));
console.log("Median track listen count: %d", median(trackListenCountValues));

console.log("Average album listen count: %d", mean(albumListenCountValues));
console.log("Median album listen count: %d", median(albumListenCountValues));

console.log("Average artist listen count: %d", mean(artistListenCountValues));
console.log("Median artist listen count: %d", median(artistListenCountValues));
console.groupEnd();

console.log();
console.group("Unique");
console.log("Unique tracks: %d", uniqueTracksSet.size);
console.log("Unique albums: %d", uniqueAlbumsSet.size);
console.log("Unique artists: %d", uniqueAristsSet.size);
console.groupEnd();

console.log();
console.group("Listening streaks");
console.log("Longest listening streak (days): %d", totalMaxStreakDays);
console.log("Longest listening streak (listens): %d", totalMaxStreakListens);
console.log("Longest non-listening spell (days): %d", totalMaxDrySpell);
console.groupEnd();
