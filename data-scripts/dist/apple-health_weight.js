"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const moment = require("moment");
const simple_statistics_1 = require("simple-statistics");
const lodash_1 = require("lodash");
const sax = require("sax");
const { _: [inFile], year: _year } = minimist(process.argv.slice(2));
assert.ok(inFile, "Missing input file argument");
assert.ok(_year, "Missing year argument");
const year = parseInt(_year);
// stream usage
// takes the same options as the parser
const processWeight = () => new Promise((resolve, reject) => {
    const rawFS = fs.createReadStream(inFile, "utf8");
    const saxStream = sax.createStream(true, {});
    const weightDocs = [];
    saxStream.on("opentag", (node) => {
        const attributes = node.attributes || {};
        const type = lodash_1.get(attributes, "type", "");
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
    const weightsFilteredByYear = weightDocs.filter(({ date }) => date.getFullYear() === year);
    const weightsByValue = weightsFilteredByYear.map(({ value }) => value);
    const quarterWeighInsMap = new Map();
    weightsFilteredByYear.forEach(weighIn => {
        const quarterKey = moment(weighIn.date).quarter();
        const quarterArray = quarterWeighInsMap.get(quarterKey) || [];
        quarterArray.push(weighIn);
        quarterWeighInsMap.set(quarterKey, quarterArray);
    });
    console.log("weigh ins", weightsFilteredByYear.length);
    console.log("heaviest: %flbs", simple_statistics_1.max(weightsByValue));
    console.log("lightest: %flbs", simple_statistics_1.min(weightsByValue));
    console.log("average: %flbs", simple_statistics_1.mean(weightsByValue));
    console.log("median: %flbs", simple_statistics_1.median(weightsByValue));
    console.log("std.dev.: %flbs", simple_statistics_1.sampleStandardDeviation(weightsByValue));
    console.group("Average weights by quarter");
    [...quarterWeighInsMap]
        .map(([quarter, weighIns]) => [quarter, simple_statistics_1.mean(weighIns.map(weighIn => weighIn.value))])
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGUtaGVhbHRoX3dlaWdodC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHBsZS1oZWFsdGhfd2VpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYix5QkFBeUI7QUFDekIsaUNBQWlDO0FBRWpDLHFDQUFxQztBQUNyQyxpQ0FBaUM7QUFHakMseURBQThGO0FBQzlGLG1DQUE2QjtBQUM3QiwyQkFBMkI7QUFFM0IsTUFBTSxFQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVuRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFFMUMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBTzdCLGVBQWU7QUFDZix1Q0FBdUM7QUFDdkMsTUFBTSxhQUFhLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLENBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDeEUsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsRCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU3QyxNQUFNLFVBQVUsR0FBZ0IsRUFBRSxDQUFDO0lBRW5DLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDekMs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