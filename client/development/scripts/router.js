//import app from "ampersand-app";
import AmpersandRouter from "ampersand-router";

//import StartPage from "./views/start";
//import StatsPage from "./views/stats";
//import MapsPage from "./views/maps";
//import MapsLegendPage from "./views/maps-legend";

import CoffeeStatsPage from "./views/stats_coffee";
//import CyclingStatsPage from "./views/stats_cycling";
//import BeerStatsPage from "./views/stats_beer";
//import HealthStatsPage from "./views/stats_health";

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
		const view = new CoffeeStatsPage({});

		view.stats.add({
			title: "foobar",
			value: "160",
			data: [0,1,2,1,1,1,0,1,4,0,3,2,1,1,2,1,2,4,2,2,1,3,0,0,2,1,3,2,3,1,1,1,1,0,0,3,1,2,2,0,0,1,4,1,1,1,2,1,1,3,4,2,1,0,1,1,1,1,1,0,2,0,2,0,0,0,4,0,1,1,3,1,2,2,4,2,2,2,0,2,3,0,1,2,3,1,1,1,2,1,1,3,1,2,2,5,1,4,3,1,3,1,1,3,4,2,8,1,2,4,0,1,8,1,1,1,2,4,3,3,2,10,2,1,2,2,1,7,4,1,2,1,6,2,3,1,3,2,4,4,7,4,3,3,1,2,2,2,4,0,0,7,4,1,9,0,4,2,1,2,4,6,3,3,1,1,2,3,3,1,3,3,4,1,1,4,3,6,2,4,2,5,2,2,4,2,2,3,3,4,1,3,1,2,7,3,4,1,2,2,0,3,2,4,6,3,1,4,1,4,5,2,5,3,2,2,2,4,2,3,1,2,2,9,2,1,3,1,3,3,3,4,5,2,1,1,5,4,2,2,3,2,3,1,2,9,2,7,3,2,5,4,2,1,2,1,3,0,3,6,4,5,3,4,1,1,3,2,1,1,2,2,8,2,5,5,1,2,2,2,3,1,2,2,1,7,2,2,5,1,2,3,5,1,1,12,2,1,1,2,2,7,2,1,1,2,2,1,5,1,4,5,3,4,1,1,1,4,2,1,1,5,4,1,2,1,2,2,2,1,5,2,0,2,2,6,1,6,2,1,8,2,1,1,1,3,3,0,1,1,2,2,1,2,0,4,1,1,1,2,1,4,0,0,1,2,5]
		});

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
