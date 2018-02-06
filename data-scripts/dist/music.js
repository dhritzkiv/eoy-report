"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const simple_statistics_1 = require("simple-statistics");
const moment = require("moment");
const utils_1 = require("./utils");
class NumberArray extends Array {
}
class NumberMap extends Map {
    constructor(entries) {
        if (entries) {
            super(entries);
        }
        else {
            super();
        }
    }
}
const sortTotalDesc = ([, a], [, b]) => b - a;
const colonJoiner = arr => arr.join(": ");
const logEachInOrderedList = (item, index) => console.log(`${index + 1}. ${item.join(": ")}`);
const isWeekend = (date) => date.weekday() === 0 || date.weekday() === 6;
const calculateStreaksForData = (data) => {
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
        }
        else {
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
const { _: [inFile, trackInfoFile] } = minimist(process.argv.slice(2));
assert.ok(inFile, "Missing input file argument");
assert.ok(trackInfoFile, "Missing track info file");
const tracksRaw = fs.readFileSync(inFile, "utf8");
const trackInfoRaw = fs.readFileSync(trackInfoFile, "utf8");
const data = JSON.parse(tracksRaw);
const trackInfoData = JSON.parse(trackInfoRaw);
assert.ok(Array.isArray(data), "Data is not an array");
assert.ok(Array.isArray(trackInfoData), "Track data is not an array");
const trackInfoMap = new Map();
trackInfoData.forEach(info => trackInfoMap.set(`${info.name}|${info.album}|${info.artist}`, info));
class Track {
    constructor(opts) {
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
            throw new Error("No info for ${this.name} - ${this.artist}");
        }
        else {
            this.info = info;
        }
    }
    get albumId() {
        return `${this.album}|${this.artist}`;
    }
    get trackId() {
        return `${this.name}|${this.artist}`;
    }
    get duration() {
        return this.info && this.info.duration || 0;
    }
}
const listens = data.map(d => new Track(d));
listens.sort(({ date: a }, { date: b }) => a.diff(b, "ms"));
const startTime = listens[0].date.clone().startOf("year");
const endTime = listens[listens.length - 1].date.clone().endOf("year");
const daysInYear = endTime.diff(startTime, "days");
const dailyListenCountsMap = new utils_1.IncrementalMap();
const dailyDurationsMap = new utils_1.IncrementalMap();
const dayOfWeekCountMap = new utils_1.IncrementalMap();
const monthCountMap = new utils_1.IncrementalMap();
for (let i = 0; i < daysInYear; i++) {
    const day = moment(startTime).add(i, "days");
    const dayOfWeekKey = day.format("dddd");
    dayOfWeekCountMap.increment(dayOfWeekKey);
    dailyListenCountsMap.set(i + 1, 0);
    dailyDurationsMap.set(i + 1, 0);
}
const getListensByDayOfWeek = (data) => {
    //create a new Map for holding values for each day of the week; fill it with empty data
    const days = new utils_1.IncrementalMap();
    data
        .map(({ date, name }) => ({ day: date.day(), name }))
        .forEach(({ day, name }) => days.increment(day));
    return [...days];
};
const listensByDayOfWeekSorted = getListensByDayOfWeek(listens)
    .map(([day, value]) => [moment().day(day).format("dddd"), value])
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
const weeksMap = new utils_1.IncrementalMap();
const weeksDurationMap = new utils_1.IncrementalMap();
const monthsMap = new utils_1.IncrementalMap();
const monthsDurationMap = new utils_1.IncrementalMap();
const dayOfWeekDurationMap = new utils_1.IncrementalMap();
const uniqueTracksSet = new Set();
const uniqueAlbumsSet = new Set();
const uniqueAristsSet = new Set();
const tracksMap = new utils_1.IncrementalMap();
const albumsMap = new utils_1.IncrementalMap();
const artistsMap = new utils_1.IncrementalMap();
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
console.groupEnd();
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
    .map(([day, count]) => [day, count / (dayOfWeekCountMap.get(day) || 1)])
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
const { maxStreakDays: totalMaxStreakDays, maxStreakListens: totalMaxStreakListens, maxDrySpell: totalMaxDrySpell } = calculateStreaksForData(dailyListenCountValues);
const listenDurations = listens.map(listen => listen.duration);
console.log();
console.group("Basic stats by track");
console.log("total tracks listened: %d", listens.length);
const averageDailyTrackListenCount = simple_statistics_1.mean(dailyListenCountValues);
const medianDailyTrackListenCount = simple_statistics_1.median(dailyListenCountValues);
console.log("Average daily track listens: %d", averageDailyTrackListenCount);
console.log("Median daily track listens: %d", medianDailyTrackListenCount);
console.log("Most daily track listens: %d", simple_statistics_1.max(dailyListenCountValues));
//console.log("Least daily track listens: %d", min(dailyListenCountValues));
console.log("Average daily listen duration: %d", moment.duration(simple_statistics_1.mean(dailyDurationValues), "ms").asMinutes());
console.log("Median daily listen duration: %d", moment.duration(simple_statistics_1.median(dailyDurationValues), "ms").asMinutes());
console.log("Most daily listen duration: %d", moment.duration(simple_statistics_1.max(dailyDurationValues), "ms").asMinutes());
console.log("Total listening time: %fh", moment.duration(simple_statistics_1.sum(listenDurations), "ms").asHours());
console.log("Average listen duration: %fm", moment.duration(simple_statistics_1.mean(listenDurations), "ms").asMinutes());
console.log("Median listen duration: %fm", moment.duration(simple_statistics_1.median(listenDurations), "ms").asMinutes());
console.log("Days without listening to music: %d", dailyListenCountValues.filter(v => !v).length);
console.log("Days listening to more music than average: %d", dailyListenCountValues.filter(v => v > averageDailyTrackListenCount).length);
console.log("Average track listen count: %d", simple_statistics_1.mean(trackListenCountValues));
console.log("Median track listen count: %d", simple_statistics_1.median(trackListenCountValues));
console.log("Average album listen count: %d", simple_statistics_1.mean(albumListenCountValues));
console.log("Median album listen count: %d", simple_statistics_1.median(albumListenCountValues));
console.log("Average artist listen count: %d", simple_statistics_1.mean(artistListenCountValues));
console.log("Median artist listen count: %d", simple_statistics_1.median(artistListenCountValues));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVzaWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbXVzaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsaUNBQWlDO0FBRWpDLHFDQUFxQztBQUNyQyx5REFBNkc7QUFDN0csaUNBQWlDO0FBQ2pDLG1DQUF1QztBQWdCdkMsaUJBQWtCLFNBQVEsS0FBYTtDQUFHO0FBSTFDLGVBQWdCLFNBQVEsR0FBbUI7SUFDMUMsWUFBWSxPQUFvQztRQUMvQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLEtBQUssRUFBRSxDQUFDO1FBQ1QsQ0FBQztJQUNGLENBQUM7Q0FDRDtBQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVFLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUYsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFtQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFeEYsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLElBQWMsRUFBRSxFQUFFO0lBQ2xELElBQUksVUFB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