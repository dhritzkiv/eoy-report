"use strict";

import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import * as moment from "moment-timezone";
import { IncrementalMap } from "./utils";
import * as csvtojson from "csvtojson";
import { median, mean, min, max, quantile, sampleStandardDeviation } from "simple-statistics";
import { get } from "lodash";
import * as sax from "sax";

const {_: [inFile], year: _year} = minimist(process.argv.slice(2));

assert.ok(inFile, "Missing input file argument");
assert.ok(_year, "Missing year argument");

const year = parseInt(_year);

interface WeightDoc {
	value: number,
	date: Date
}

// stream usage
// takes the same options as the parser
const processWeight = () => new Promise<WeightDoc[]>((resolve, reject) => {
	const rawFS = fs.createReadStream(inFile, "utf8");
	const saxStream = sax.createStream(true, {});

	const weightDocs: WeightDoc[] = [];

	saxStream.on("opentag", (node) => {
		const attributes = node.attributes || {};
		const type = get(attributes, "type", "");

		if (node.name === "Record" && type === "HKQuantityTypeIdentifierBodyMass") {

			const weightDoc = {
				value: parseFloat(attributes.value),
				date: new Date(attributes.creationDate)
			};

			weightDocs.push(weightDoc);
			console.log("weight record", weightDoc);
		}
	});

	saxStream.on("end", () => resolve(weightDocs));

	// pipe is supported, and it's readable/writable
	// same chunks coming in also go out.
	rawFS.pipe(saxStream);
});

const main = async () => {
	console.time("stream");

	const weightDocs = await processWeight();

	console.timeEnd("stream");

	const weightsFilteredByYear = weightDocs.filter(({date}) => date.getFullYear() === year);

	//const sortedWeightsByDate = weightsFilteredByYear.sort(({date: a}, {date: b}) => Number(a) - Number(b));
	//const sortedWeightsByValue = weightsFilteredByYear.sort(({value: a}, {value: b}) => b - a);
	const weightsByValue = weightsFilteredByYear.map(({value}) => value);

	console.log("weights recorded", weightsFilteredByYear.length);
	console.log("heaviest: %flbs", max(weightsByValue));
	console.log("lightest: %flbs", min(weightsByValue));
	console.log("average: %flbs", mean(weightsByValue));
	console.log("median: %flbs", median(weightsByValue));
	console.log("std.dev.: %flbs", sampleStandardDeviation(weightsByValue));

	/*const maximumDelta = [...sortedWeightsByDate]
	.reverse()
	.reduce((maximum, current, index, array) => {

		if (index === 0) {
			return maximum;
		}

		const previous = array[index - 1];

		const timeDifference = (Number(current.date) - Number(previous.date)) / 1000 / 60 / 60 / 24;
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

	console.log("maximum change in time period", maximumDelta);*/
};

main();
