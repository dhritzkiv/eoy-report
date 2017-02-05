"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const StartPage = require("./views/start");
const StatsPage = require("./views/stats");
const MapsPage = require("./views/maps");
const MapsLegendPage = require("./views/maps-legend");

const CyclingStatsPage = require("./views/stats_cycling");
const BeerStatsPage = require("./views/stats_beer");

const DEFAULT_TITLE = "Daniel's Twenty Sixteen";

const Router = AmpersandRouter.extend({
	routes: {
		"": "start",
		"cycling": "cycling",
		"walking": "walking",
		"audio-video": "av",
		"beer": "beer"
		"stats": "stats",
		"stats/:type": "stats"*/
	},
	start: function() {

		//noop
	},

		this.trigger("navigation");
	},

		this.trigger("navigation");
	},
	beer() {
		const view = new BeerStatsPage({});

		this.trigger("newPage", view);
		this.trigger("navigation");
	}
});

module.exports = Router;
