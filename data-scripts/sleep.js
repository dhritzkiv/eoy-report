"use strict";

const fs = require("fs");
const moment = require("moment");
const padStart = require("lodash/padStart");
const partialRight = require("lodash/partialRight");

const millisecondsAsReadableHourString = (milliseconds) => {
	const duration = moment.duration(milliseconds);

	const padder = partialRight(padStart, 2, "0");

	const hours = padder(parseInt(duration.asHours(), 10));
	const minutes = padder(duration.minutes());
	const seconds = padder(duration.seconds());

	return `${hours}:${minutes}:${seconds}`;
};

const getMedian = (array) => {
	const isEven = array.length % 2 === 0;
	const halfLength = array.length / 2;

	if (!isEven) {
		return array[Math.floor(halfLength)];

	} else {
		return (array[halfLength] + array[halfLength - 1]) / 2;
	}
};

const addUpDuration = (array) => array.map(({duration}) => duration).reduce((a, b) => a + b, 0);
const sortByDuration = (array) => array.map(({duration}) => duration).sort((a, b) => b - a);

const raw = fs.readFileSync(process.argv[2], "utf8");

const [/*header*/, ...lines] = raw.split("\n");

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

const checkIfIceland = date => moment(date).isBetween("2016-06-16", "2016-06-22", null, "[]");

let data = lines
.map(line => line.split(";"))
.map(([start, end, quality]) => ({
	start_date: moment(start, DATE_FORMAT),
	end_date: moment(end, DATE_FORMAT),
	quality: parseInt(quality, 10)
}))
.filter(({start_date}) => start_date.year() === 2016)
.sort(({start_date: a}, {start_date: b}) => a - b);

data.forEach((night) => {
	night.duration = night.end_date - night.start_date;
});

//because the app's data didn't think to export in UTC (or with TZ info)…
data
.forEach((night) => {
	let tzOffset = -5;

	if (night.start_date.isDST()) {
		tzOffset += 1;
	}

	if (checkIfIceland(night.start_date)) {
		tzOffset *= -1;

		night.start_date.utcOffset(tzOffset, false);
		night.end_date.utcOffset(tzOffset, false);

		return;
	}

	//night.start_date.utcOffset(tzOffset, true);
	//night.end_date.utcOffset(tzOffset, true);
});

data = data.filter(({duration}) => duration > 7200000);

const [{start_date: firstDate}] = data;
const [{end_date: lastDate}] = [...data].reverse();
const dateAfterLast = moment(lastDate).add(1, "days");

//is school night = woke up on a work day (monday - friday)
const isSchoolNight = (date) => date.day() >= 1 && date.day() <= 5;

const schoolNights = data.filter(({end_date}) => isSchoolNight(end_date));
const weekendNights = data.filter(({end_date}) => !isSchoolNight(end_date));

const totalDuration = addUpDuration(data);
const schoolNightDuration = addUpDuration(schoolNights);
const weekendDuration = addUpDuration(weekendNights);

const nightsSortedByDuration = sortByDuration(data);
const schoolNightsSortedByDuration = sortByDuration(schoolNights);
const weekendNightsSortedByDuration = sortByDuration(weekendNights);
const medianDuration = getMedian(nightsSortedByDuration);
const medianSchoolNightDuration = getMedian(schoolNightsSortedByDuration);
const medianWeekendNightDuration = getMedian(weekendNightsSortedByDuration);

console.log("total nights recorded", data.length);
console.log("school nights recorded", schoolNights.length);
console.log("weekend nights recorded", weekendNights.length);
console.log("\n");
/*console.log("total sleep (hours)", millisecondsAsReadableHourString(totalDuration));
console.log("total school night sleep (hours)", millisecondsAsReadableHourString(schoolNightDuration));
console.log("total weekend night sleep (hours)", millisecondsAsReadableHourString(weekendDuration));
console.log("\n");*/
console.log("average nightly sleep (hours)", millisecondsAsReadableHourString(totalDuration / data.length));
console.log("average school night sleep (hours)", millisecondsAsReadableHourString(schoolNightDuration / schoolNights.length));
console.log("average weekend night sleep (hours)", millisecondsAsReadableHourString(weekendDuration / weekendNights.length));
console.log("\n");
console.log("median nightly sleep (hours)", millisecondsAsReadableHourString(medianDuration));
console.log("median school night sleep (hours)", millisecondsAsReadableHourString(medianSchoolNightDuration));
console.log("median weekend night sleep (hours)", millisecondsAsReadableHourString(medianWeekendNightDuration));
console.log("\n");
console.log("longest school night (hours)", millisecondsAsReadableHourString(schoolNightsSortedByDuration[0]));
console.log("longest weekend night (hours)", millisecondsAsReadableHourString(weekendNightsSortedByDuration[0]));
console.log("shortest school night (hours)", millisecondsAsReadableHourString(schoolNightsSortedByDuration[schoolNightsSortedByDuration.length - 1]));
console.log("shortest weekend night (hours)", millisecondsAsReadableHourString(weekendNightsSortedByDuration[weekendNightsSortedByDuration.length - 1]));

const middayHour = 12;
const midnightHour = 0;
const timestampFormat = "HH:mm:ss";

const sortedByStartTime = [...data].sort((a, b) => {
	const aTime = moment(a.start_date).format(timestampFormat);
	const bTime = moment(b.start_date).format(timestampFormat);

	const aSplit = aTime.split(":").map(num => parseInt(num, 10));
	const bSplit = bTime.split(":").map(num => parseInt(num, 10));

	//midday = after noon, before midnight;
	const aDateDay = aSplit[0] > middayHour ? 1 : 2;
	const bDateDay = bSplit[0] > middayHour ? 1 : 2;

	//normalize the dates for quick comparison
	const aDate = new Date(2017, 0, aDateDay, ...aSplit);
	const bDate = new Date(2017, 0, bDateDay, ...bSplit);

	return aDate - bDate;
}, {
	start_date: new Date(2017, 0, 1, middayHour, 0, 0)
});

const sortedByEndTime = [...data].sort((a, b) => {
	const aTime = moment(a.end_date).format(timestampFormat);
	const bTime = moment(b.end_date).format(timestampFormat);

	const aSplit = aTime.split(":").map(num => parseInt(num, 10));
	const bSplit = bTime.split(":").map(num => parseInt(num, 10));

	//midday = after noon, before midnight;
	const aDateDay = aSplit[0] > midnightHour ? 1 : 2;
	const bDateDay = bSplit[0] > midnightHour ? 1 : 2;

	//normalize the dates for quick comparison
	const aDate = new Date(2017, 0, aDateDay, ...aSplit);
	const bDate = new Date(2017, 0, bDateDay, ...bSplit);

	return aDate - bDate;
}, {
	start_date: new Date(2017, 0, 1, midnightHour, 0, 0)
});

const earliestStart = sortedByStartTime[0];
const latestStart = [...sortedByStartTime].reverse()[0];

console.log("\n");
console.log(earliestStart);
console.log("earliest start time", moment(earliestStart.start_date).format(timestampFormat));
console.log(latestStart);
console.log("latest start time", moment(latestStart.start_date).format(timestampFormat));

const earliestEnd = sortedByEndTime[0];
const latestEnd = [...sortedByEndTime].reverse()[0];

console.log("\n");
console.log(earliestEnd);
console.log("earliest end time", moment(earliestEnd.end_date).format(timestampFormat));
console.log(latestEnd);
console.log("latest end time", moment(latestEnd.end_date).format(timestampFormat));
