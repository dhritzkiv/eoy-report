"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const StartPage = require("./views/start");
const StatsPage = require("./views/stats");
const MapsPage = require("./views/maps");
const MapsLegendPage = require("./views/maps-legend");

const CoffeeStatsPage = require("./views/stats_coffee");
const CyclingStatsPage = require("./views/stats_cycling");
const BeerStatsPage = require("./views/stats_beer");
const HealthStatsPage = require("./views/stats_health");

const DEFAULT_TITLE = "Daniel's Twenty Sixteen";

const Router = AmpersandRouter.extend({
	routes: {
		"": "start",
		"coffee": "coffee",
		"cycling": "cycling",
		"walking": "walking",
		"audio-video": "av",
		"beer": "beer",
		"health": "health"
	},
	start: function() {

		//noop
	},
	coffee() {
		const view = new CoffeeStatsPage();

		this.trigger("newPage", view);
		this.trigger("navigation");
	},
	cycling() {
		const view = new CyclingStatsPage();

		this.trigger("newPage", view);
		this.trigger("navigation");
	},
	beer() {
		const view = new BeerStatsPage({});

		this.trigger("newPage", view);
		this.trigger("navigation");
	},
	health() {
		const view = new HealthStatsPage({});

		this.trigger("newPage", view);
		this.trigger("navigation");
	}
});

module.exports = Router;
