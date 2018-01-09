"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = require("path");
const asyncExecFile = util_1.promisify(child_process_1.execFile);
const DATA_SRC_DIR = path.resolve(__dirname, "../../data");
const DATA_DEST_DIR = path.resolve(__dirname, "../../client/public/data");
const SCRIPTS_DIR = __dirname;
const DEDUPED_SIMPLIFIED_RIDES = path.join(DATA_SRC_DIR, "2017_rides_deduped_simplified.json");
const DEDUPED_SIMPLIFIED_WALKS = path.join(DATA_SRC_DIR, "2017_walks_deduped_simplified.json");
const areas = [
    {
        name: "toronto",
        boundary: [
            [-81.0041, 42.6532],
            [-77.6944, 44.5221]
        ]
    },
    {
        name: "montreal",
        boundary: [[-73.836769, 45.392057], [-73.454459, 45.671406]]
    },
    {
        name: "sydney",
        boundary: [[151.12094, -34.000247], [151.302217, -33.81795]]
    },
    {
        name: "melbourne",
        boundary: [[144.801803, -37.894592], [145.124183, -37.716918]]
    },
    {
        name: "auckland",
        boundary: [[174.670433, -36.963407], [174.910759, -36.788739]]
    },
    {
        name: "vancouver",
        boundary: [[-123.232761, 49.211834], [-123.022304, 49.332126]]
    }
];
const main = async () => {
    /*
    //get strava ride ids
    await asyncExecFile(`node`, [
        path.join(SCRIPTS_DIR, "get-strava-ride-ids.js"),
        path.join(DATA_SRC_DIR, "2017_ride_ids.json"),
        "--year=2017"
    ]);

    //get strava rides from ids
    await asyncExecFile(`node`, [
        path.join(SCRIPTS_DIR, "get-strava-rides-from-ids.js"),
        path.join(DATA_SRC_DIR, "2017_ride_ids.json"),
        path.join(DATA_SRC_DIR, "2017_rides.json")
    ]);
    */
    await asyncExecFile(`node`, [
        path.join(SCRIPTS_DIR, "rides.js"),
        path.join(DATA_SRC_DIR, "2017_rides.json"),
        DEDUPED_SIMPLIFIED_RIDES
    ]);
    for (const area of areas) {
        await asyncExecFile(`node`, [
            path.join(SCRIPTS_DIR, "strava-rides-to-geojson.js"),
            DEDUPED_SIMPLIFIED_RIDES,
            path.join(DATA_DEST_DIR, `2017_rides_${area.name}.geojson`),
            `--boundary=${JSON.stringify(area.boundary)}`
        ]);
    }
    await asyncExecFile(`node`, [
        path.join(SCRIPTS_DIR, "walks.js"),
        path.join(DATA_SRC_DIR, "2017_walks.json"),
        DEDUPED_SIMPLIFIED_WALKS
    ]);
    for (const area of areas) {
        await asyncExecFile(`node`, [
            path.join(SCRIPTS_DIR, "walks-to-geojson.js"),
            DEDUPED_SIMPLIFIED_WALKS,
            path.join(DATA_DEST_DIR, `2017_walks_${area.name}.geojson`),
            `--boundary=${JSON.stringify(area.boundary)}`
        ]);
    }
};
main();
//# sourceMappingURL=output.js.map