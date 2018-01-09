"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const moment = require("moment");
const Moves = require("moves-api");
const util_1 = require("util");
const { _: [outFile], c: configPath, year: yearString } = minimist(process.argv.slice(2));
assert(outFile, "output file not specified");
assert(configPath, "config not specified");
const year = parseInt(yearString, 10);
assert.equal(typeof year, "number");
assert(Number.isFinite(year));
const configRaw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configRaw);
const moves = new Moves.MovesApi(config);
const asyncGetStoryline = util_1.promisify(moves.getStoryline.bind(moves));
const concatArrays = (a, b) => a.concat(b);
const getWalks = async () => {
    const weeks = [];
    const startOfYear = moment().year(2017).startOf("year");
    const endOfYear = moment(startOfYear).endOf("year");
    for (let i = 0; i <= 52; i++) {
        const fromDate = moment(startOfYear).add(i, "weeks");
        const toDate = moment(fromDate).endOf("week");
        if (fromDate.isAfter(new Date()) || fromDate.isAfter(endOfYear)) {
            break;
        }
        const data = await asyncGetStoryline({
            from: fromDate,
            to: toDate,
            trackPoints: true
        });
        console.log("got week %d", i);
        const walks = data
            .filter(({ date }) => parseInt(date.substring(0, 4), 10) === year)
            .map(({ segments }) => segments)
            .reduce(concatArrays, [])
            .filter(seg => seg)
            .filter(({ type }) => type === "move")
            .map(({ activities }) => activities)
            .reduce(concatArrays, [])
            .filter(({ group }) => group === "walking" || group === "running")
            .map(({ trackPoints }) => trackPoints)
            .map(walks => walks.map(({ lon, lat }) => [lon, lat]))
            .map(points => ({ points }));
        weeks.push(walks);
    }
    const weeksMerged = weeks.reduce((a, b) => a.concat(b), []);
    const walksJSON = JSON.stringify(weeksMerged, null, "\t");
    fs.writeFileSync(outFile, walksJSON);
};
getWalks();
//# sourceMappingURL=get-moves-walks.js.map