//import app from "ampersand-app";
import AmpersandRouter from "ampersand-router";

//import StartPage from "./views/start";
//import StatsPage from "./views/stats";
//import MapsPage from "./views/maps";
//import MapsLegendPage from "./views/maps-legend";

import CoffeeStatsPage from "./views/stats_coffee";
import CyclingStatsPage from "./views/stats_cycling";
import BeerStatsPage from "./views/stats_beer";
import HealthStatsPage from "./views/stats_health";

//const DEFAULT_TITLE = "Daniel's Twenty Seventeen";

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

export default Router;
