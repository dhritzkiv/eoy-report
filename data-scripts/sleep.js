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

const data = lines
.map(line => line.split(";"))
.map(([start, end, quality]) => ({
	start_date: new Date(start),
	end_date: new Date(end),
	quality: parseInt(quality, 10)
}))
.filter(({start_date}) => start_date.getFullYear() === 2016)
.sort(({start_date: a}, {start_date: b}) => a - b);

data.forEach((night) => {
	night.duration = night.end_date - night.start_date;
});

const [{start_date: firstDate}] = data;
const [{end_date: lastDate}] = [...data].reverse();
const dateAfterLast = new Date(lastDate);

dateAfterLast.setDate(dateAfterLast.getDate() + 1);

//is school night = woke up on a work day (monday - friday)
const isSchoolNight = (date) => date.getDay() >= 1 && date.getDay() <= 5;

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

let maxStreakCoffees = 0;
let maxDrySpell = 0;

const calculateStreaksForData = (data) => {
	let streakCoffees = 0;
	let drySpell = 0;
	maxStreakCoffees = 0;
	maxDrySpell = 0;

	data.forEach(({value}) => {
		if (value) {
			drySpell = 0;
			streakCoffees++;
			maxStreakCoffees = Math.max(maxStreakCoffees, streakCoffees);
		} else {
			streakCoffees = 0;
			drySpell++;
			maxDrySpell = Math.max(maxDrySpell, drySpell);
		}
	});
};

/*calculateStreaksForData(data);

const totalMaxStreakCoffees = maxStreakCoffees;
const totalMaxDrySpell = maxDrySpell;

calculateStreaksForData(weekdayDays);

const weekdayMaxStreakCoffees = maxStreakCoffees;
const weekdayMaxDrySpell = maxDrySpell;

calculateStreaksForData(weekendDays);

const weekendMaxStreakCoffees = maxStreakCoffees;
const weekendMaxDrySpell = maxDrySpell;*/

/*for (let current = new Date(firstDate); current < dateAfterLast; current.setDate(current.getDate() + 1)) {
	console.log(current.toISOString())
}*/

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


