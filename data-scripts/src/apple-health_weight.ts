"use strict";

import * as fs from "fs";
import * as assert from "assert";
import * as path from "path";
import * as minimist from "minimist";
import * as moment from "moment";
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
			//console.log("weight record", weightDoc);
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
	const weightsByValue = weightsFilteredByYear.map(({value}) => value);

	const quarterWeighInsMap = new Map<number, WeightDoc[]>();

	weightsFilteredByYear.forEach(weighIn => {
		const quarterKey = moment(weighIn.date).quarter();
		const quarterArray = quarterWeighInsMap.get(quarterKey) || [];

		quarterArray.push(weighIn);

		quarterWeighInsMap.set(quarterKey, quarterArray);
	});

	console.log("weigh ins", weightsFilteredByYear.length);
	console.log("heaviest: %flbs", max(weightsByValue));
	console.log("lightest: %flbs", min(weightsByValue));
	console.log("average: %flbs", mean(weightsByValue));
	console.log("median: %flbs", median(weightsByValue));
	console.log("std.dev.: %flbs", sampleStandardDeviation(weightsByValue));

	console.group("Average weights by quarter");
	[...quarterWeighInsMap]
	.map(([quarter, weighIns]) => [quarter, mean(weighIns.map(weighIn => weighIn.value))])
	.sort(([a], [b]) => a - b)
	.forEach(([quarter, averageWeight]) => console.log("Quarter %d: %flbs", quarter, averageWeight));
	console.groupEnd();

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
