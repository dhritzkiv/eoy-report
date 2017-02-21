"use strict";

const fs = require("fs");

const get = require("lodash/get");
const sax = require("sax");

const rawFS = fs.createReadStream(process.argv[2], "utf8");

const weights = [];

console.time("stream");

// stream usage
// takes the same options as the parser
const saxStream = sax.createStream(true, {});

saxStream.on("opentag", (node) => {

	const attributes = node.attributes || {};
	const type = get(attributes, "type", "");

	if (node.name === "Record" && type === "HKQuantityTypeIdentifierBodyMass") {
		const weightDoc = {
			value: parseFloat(attributes.value),
			date: new Date(attributes.creationDate)
		};

		weights.push(weightDoc);
	}
});

saxStream.on("end", () => {
	console.timeEnd("stream");

	const weightsFilteredByYear = weights.filter(({date}) => date.getFullYear() === 2016);

	console.log("weights recorded", weightsFilteredByYear.length);

	const sortedWeightsByDate = weightsFilteredByYear.sort(({date: a}, {date: b}) => a - b);
	const sortedWeightsByValue = weightsFilteredByYear.sort(({value: a}, {value: b}) => b - a);
	const totalWeight = weightsFilteredByYear.map(({value}) => value).reduce((a, b) => a + b, 0);
	const averageWeight = totalWeight / weightsFilteredByYear.length;

	console.log("heaviest", sortedWeightsByValue[0].value);
	console.log("lightest", sortedWeightsByValue[sortedWeightsByValue.length - 1].value);

	console.log("average", averageWeight);


	const maximumDelta = [...sortedWeightsByDate]
	.reverse()
	.reduce((maximum, current, index, array) => {

		if (index === 0) {
			return maximum;
		}

		const previous = array[index - 1];

		const timeDifference = (current.date - previous.date) / 1000 / 60 / 60 / 24;
		const valueDifference = current.value - previous.value;

		if (timeDifference <= 0.5) {
			return maximum;
		}

		const differenceOverTime = Math.abs(valueDifference) / timeDifference;
		const maximumDifferenceOverTime = Math.abs(maximum.value) / maximum.time;

		if (differenceOverTime >= maximumDifferenceOverTime) {
			return {
				time: timeDifference,
				value: valueDifference
			};
		} else {
			return maximum;
		}
	}, {
		time: Number.MAX_VALUE,
		value: 0
	});

	console.log("maximum change in time period", maximumDelta);
});

// pipe is supported, and it's readable/writable
// same chunks coming in also go out.
rawFS.pipe(saxStream);
