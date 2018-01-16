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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LW1vdmVzLXRva2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dldC1tb3Zlcy10b2tlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHlCQUF5QjtBQUN6QixpQ0FBaUM7QUFDakMscUNBQXFDO0FBRXJDLG1DQUFtQztBQUduQywrQkFBaUM7QUFFakMsTUFBTSxFQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFDLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFOUQsTUFBTSxDQUFDLFVBQVUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0FBRTNDLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXpDLE1BQU0sbUJBQW1CLEdBQUcsZ0JBQVMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRXhFLE1BQU0sSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ3ZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDVixNQUFNLFFBQVEsR0FBRyxNQUFNLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1AsaUNBQWlDO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUU1RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7QUFDRixDQUFDLENBQUM7QUFFRixJQUFJLEVBQUUsQ0FBQyJ9