"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const minimist = require("minimist");
const Moves = require("moves-api");
const util_1 = require("util");
const { c: configPath, code } = minimist(process.argv.slice(2));
assert(configPath, "config not specified");
const configRaw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configRaw);
const moves = new Moves.MovesApi(config);
const asyncGetAccessToken = util_1.promisify(moves.getAccessToken.bind(moves));
const main = async () => {
    if (code) {
        const authData = await asyncGetAccessToken(code);
        console.log(authData);
    }
    else {
        // Redirect your user to this url
        const url = moves.generateAuthUrl(["location", "activity"]);
        console.log(url);
    }
};
main();
//# sourceMappingURL=get-moves-token.js.map