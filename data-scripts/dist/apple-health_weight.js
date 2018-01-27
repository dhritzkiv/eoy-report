"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
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
    const weightsFilteredByYear = weightDocs.filter(({ date }) => date.getFullYear() === year);
    //const sortedWeightsByDate = weightsFilteredByYear.sort(({date: a}, {date: b}) => Number(a) - Number(b));
    //const sortedWeightsByValue = weightsFilteredByYear.sort(({value: a}, {value: b}) => b - a);
    const weightsByValue = weightsFilteredByYear.map(({ value }) => value);
    console.log("weights recorded", weightsFilteredByYear.length);
    console.log("heaviest: %flbs", simple_statistics_1.max(weightsByValue));
    console.log("lightest: %flbs", simple_statistics_1.min(weightsByValue));
    console.log("average: %flbs", simple_statistics_1.mean(weightsByValue));
    console.log("median: %flbs", simple_statistics_1.median(weightsByValue));
    console.log("std.dev.: %flbs", simple_statistics_1.sampleStandardDeviation(weightsByValue));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGUtaGVhbHRoX3dlaWdodC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHBsZS1oZWFsdGhfd2VpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYix5QkFBeUI7QUFDekIsaUNBQWlDO0FBRWpDLHFDQUFxQztBQUlyQyx5REFBOEY7QUFDOUYsbUNBQTZCO0FBQzdCLDJCQUEyQjtBQUUzQixNQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLDZCQUE2QixDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUUxQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFPN0IsZUFBZTtBQUNmLHVDQUF1QztBQUN2QyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN4RSxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTdDLE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUM7SUFFbkMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNoQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztRQUN6QyxNQUFNLElBQUksR0FBRyxZQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLEtBQUssa0NBQWtDLENBQUMsQ0FBQyxDQUFDO1lBRTNFLE1BQU0sU0FBUyxHQUFHO2dCQUNqQixLQUFLLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7Z0JBQ25DLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO2FBQ3ZDLENBQUM7WUFFRixVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7SUFDRixDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBRS9DLGdEQUFnRDtJQUNoRCxxQ0FBcUM7SUFDckMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFdkIsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztJQUV6QyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTFCLE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQztJQUV6RiwwR0FBMEc7SUFDMUcsNkZBQTZGO0lBQzdGLE1BQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXJFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSx1QkFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSx1QkFBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSx3QkFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsMEJBQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsMkNBQXVCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUV4RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2lFQWlDNkQ7QUFDOUQsQ0FBQyxDQUFDO0FBRUYsSUFBSSxFQUFFLENBQUMifQ==