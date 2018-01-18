import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
import * as minimist from "minimist";
import * as moment from "moment";
import * as Moves from "moves-api";
import { IncrementalMap, WalkingDay } from "./utils";
import * as request from "request";
import { promisify } from "util";

const {_: [outFile], c: configPath, year: yearString} = minimist(process.argv.slice(2));

assert(outFile, "output file not specified");
assert(configPath, "config not specified");

const year = parseInt(yearString, 10);

assert.equal(typeof year, "number");
assert(Number.isFinite(year));

const configRaw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configRaw);
const moves = new Moves.MovesApi(config);

const asyncGetSummaries = promisify(moves.getSummaries.bind(moves));

const concatArrays = <T>(a: T[], b: T[]): T[] => a.concat(b);

const getSummaries = async () => {
	const currentDatePlusOneMonth = new Date();

	currentDatePlusOneMonth.setMonth(currentDatePlusOneMonth.getMonth() + 1);

	const months: WalkingDay[] = [];

	for (let monthNumber = 0; monthNumber < 12; monthNumber++) {
		const monthDate = new Date(year, monthNumber, 1);

		const data: WalkingDay[] = await asyncGetSummaries({
			month: monthDate
		});

		console.log("got month %d", monthNumber);

		const days = data
		//a week may contain days from another year
		.filter(({date}) => parseInt(date.substring(0, 4), 10) === year)
		.filter(({summary}) => summary)
		.map(({date, summary}) => {
			summary = summary.filter(({group}) => (
				group === "walking" || group === "running"
			))

			return {
				date,
				summary
			};
		});

		months.push(...days);
	}

	const walksJSON = JSON.stringify(months, null, "\t");

	fs.writeFileSync(outFile, walksJSON);
};

getSummaries();
