"use strict";

const fs = require("fs");
const path = require("path");
const Moves = require("moves-api");
const async = require("async");
const request = require("request");

const [method, _year] = process.argv.slice(2);
const year = parseInt(_year, 10) || new Date().getFullYear();

const configPath = path.join(process.cwd(), "./data/moves_config.json");

const movesConfig = require(configPath);

const moves = new Moves.MovesApi(movesConfig);

const concatArrays = (a, b) => a.concat(b);

const getTotalSteps = (year) => {
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
};

const getWalks = (year) => {

	async.timesSeries(52, (weekNumber, next) => {
		const dateInWeek = (1 + (7 * (weekNumber - 1)));
		const weekDate = new Date(year, 0, dateInWeek);

		if (weekDate > new Date()) {
			return next(null, []);
		}

		moves.getStoryline({
			week: weekDate,
			trackPoints: true
		}, (err, data) => {

			if (err) {
				return next(err);
			}

			console.log("got week %d", weekNumber);

			const walks = data
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
			.map(walks => walks.map(({lon, lat}) => [lon, lat]))
			//each walk is an object to match other data structures
			.map(walks => ({points: walks}));

			next(null, walks);
		});
	}, (err, weeks) => {

		if (err) {
			return console.error(err);
		}

		weeks = weeks.reduce(concatArrays, []);

		const walksJSON = JSON.stringify(weeks, null, "\t");

		fs.writeFileSync(path.join(process.cwd(), "data", `${year}_walks.json`), walksJSON);
	});
};


switch (method) {
	case "getTotalSteps":
		getTotalSteps(year);
		break;
	case "reduceTotalSteps":
		reduceTotalSteps(year);
		break;
	case "getWalks":
		getWalks(year);
		break;
	case "exchange":
		request.post("https://api.moves-app.com/oauth/v1/access_token", {
			qs: {
				grant_type: "authorization_code",
				code: _year,//use _year as code
				client_id: movesConfig.clientId,
				client_secret: movesConfig.clientSecret,
				redirect_uri: movesConfig.redirectUri
			}
		}, (err, req, body) => {

			if (err) {
				throw err;
			}

			console.log(body);
		});
		break;
	default: {
		const instructions = (
		`
			Usage:

			node get-moves-data [method] [year|code]

			where [method] is "getTotalSteps", "reduceTotalSteps", "getWalks"; and
			where [year] is the year you want to query;

			there is also a way to exchange a code for an access_token:
			[method] is "exchange" and [code] is the code from the auth request
		`
		)
		.split("\n")
		.map(line => line.replace(/^\t+/, ""))
		.join("\n");

		console.log(instructions);
	}
}

//getTotalSteps(2016);

//getWalks(2016);
