import * as path from "path";
import * as fs from "fs";
import * as assert from "assert";
import * as minimist from "minimist";
import * as moment from "moment";
import * as Moves from "moves-api";
import { IncrementalMap, SimpleFoursquareCheckin as SimpleCheckin } from "./utils";
import * as request from "request";
import { promisify } from "util";

const {c: configPath, code} = minimist(process.argv.slice(2));

assert(configPath, "config not specified");

const configRaw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configRaw);
const moves = new Moves.MovesApi(config);

const asyncGetAccessToken = promisify(moves.getAccessToken.bind(moves));

const main = async () => {
	if (code) {
		const authData = await asyncGetAccessToken(code);

		console.log(authData);
	} else {
		// Redirect your user to this url
		const url = moves.generateAuthUrl(["location", "activity"]);

		console.log(url);
	}
};

main();
