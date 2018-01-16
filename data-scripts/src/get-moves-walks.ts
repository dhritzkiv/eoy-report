import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
import * as minimist from "minimist";
import * as moment from "moment";
import * as Moves from "moves-api";
import { IncrementalMap, Walk } from "./utils";
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

const asyncGetStoryline = promisify(moves.getStoryline.bind(moves));

const concatArrays = <T>(a: T[], b: T[]): T[] => a.concat(b);

/*const getTotalSteps = (year) => {
	const currentDatePlusOneMonth = new Date();

	currentDatePlusOneMonth.setMonth(currentDatePlusOneMonth.getMonth() + 1);

	async.timesSeries(12, (monthNumber, next) => {
		const monthDate = new Date(year, monthNumber, 1);//despite JS months being 0-indexed, this isn't

		if (monthDate > currentDatePlusOneMonth) {
			return next(null, []);
		}

		moves.getSummaries({
			month: monthDate
		}, (err, data) => {

			if (err) {
				return next(err);
			}

			console.log("got month %d", monthNumber);

			const walks = data
			//a week may contain days from another year
			.filter(({date}) => parseInt(date.substring(0, 4), 10) >= year)
			//we only need summaries
			.map(({summary}) => summary)
			.filter(summaries => summaries)
			.map((summaries) => summaries.filter(({group}) => (
				group === "walking" || group === "running"
			)))
			//flatten array
			.reduce(concatArrays, []);

			next(null, walks);
		});
	}, (err, months) => {

		if (err) {
			return console.error(err);
		}

		const allDays = months.reduce(concatArrays, []);
		const walksJSON = JSON.stringify(allDays, null, "\t");

		const walkingDaysPath = path.join(process.cwd(), "data", `${year}_walking-days.json`);

		fs.writeFileSync(walkingDaysPath, walksJSON);
	});
};

const reduceTotalSteps = (year) => {
	const walkingDaysPath = path.join(process.cwd(), "data", `${year}_walking-days.json`);
	const walkingDays = JSON.parse(fs.readFileSync(walkingDaysPath, "utf8"));

	const walkingDaysSummary = walkingDays.reduce((total, current) => ({
		duration: total.duration + current.duration,
		distance: total.distance + current.distance,
		steps: total.steps + current.steps,
		calories: total.calories + current.calories
	}));

	const daysInYear = Math.round(
		new Date(year, 11, 31, 23, 59, 59) - new Date(year, 0, 1)
	) / (1000 * 60 * 60 * 24);

	console.log(`${year} walking stats:`);

	Object
	.entries(walkingDaysSummary)
	.forEach(([k, v]) => console.log(`total annual ${k}: ${v}`));

	Object
	.entries(walkingDaysSummary)
	.map(([k, v]) => [k, (v / 52).toFixed(2)])
	.forEach(([k, v]) => console.log(`average weekly ${k}: ${v}`));

	Object
	.entries(walkingDaysSummary)
	.map(([k, v]) => [k, (v / daysInYear).toFixed(2)])
	.forEach(([k, v]) => console.log(`average daily ${k}: ${v}`));
};*/

type Walks = Walk[];

interface Activity {
	group: string;
	trackPoints: {
		lat: number;
		lon: number;
	}[]
}

interface Segment {
	type: string;
	activities: Activity[]
}

interface StorylineDatum {
	date: string;
	segments: Segment[];
}

const getWalks = async () => {
	const weeks: Walks[] = [];
	const startOfYear = moment().year(2017).startOf("year");
	const endOfYear = moment(startOfYear).endOf("year");

	for (let i = 0; i <= 52; i++) {
		const fromDate = moment(startOfYear).add(i, "weeks");
		const toDate = moment(fromDate).endOf("week");

		if (fromDate.isAfter(new Date()) || fromDate.isAfter(endOfYear)) {
			break;
		}

		const data: StorylineDatum[] = await asyncGetStoryline({
			from: fromDate,
			to: toDate,
			trackPoints: true
		});

		console.log("got week %d", i);

		const walks: Walks = data
		//a week may contain days from another year
		.filter(({date}) => parseInt(date.substring(0, 4), 10) === year)
		//we only need segments
		.map(({segments}) => segments)
		//days can be merged
		.reduce(concatArrays, [])
		//filter out any null segments
		.filter(seg => seg)
		//only include move activities
		.filter(({type}) => type === "move")
		//return only activities
		.map(({activities}) => activities)
		//activities can have multiple parts?
		.reduce(concatArrays, [])
		//only include walking activities (cycling is handled differently)
		.filter(({group}) => group === "walking" || group === "running")
		//we're only interested in the points
		.map(({trackPoints}) => trackPoints)
		//format the point objects to [lon, lat] arrays
		.map(walks => walks.map(({lon, lat}): [number, number] => [lon, lat]))
		//each walk is an object to match other data structures
		.map(points => ({points}));

		weeks.push(walks);
	}

	const weeksMerged = weeks.reduce(concatArrays, <Walk[]>[]);
	const walksJSON = JSON.stringify(weeksMerged, null, "\t");

	fs.writeFileSync(outFile, walksJSON);
};

getWalks();
