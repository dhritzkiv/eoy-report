"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const StatsPage = require("./views/stats");
const MapsPage = require("./views/maps");

const Router = AmpersandRouter.extend({
	initialize: function() {
		this.on("newMode", view => this.currentModeView = view);
	},
	routes: {
		"": "root",
		"maps": "maps",
		"maps/:city": "maps",
		"stats": "stats",
		"stats/:type": "stats"
	},
	currentModeView: null,
	root: function() {
		this.navigate("/stats");
	},
	maps: function(city) {
		
		if (!city) {
			return this.redirectTo("/maps/to");
		}
		
		const currentModeView = this.currentModeView;
		
		if (currentModeView instanceof MapsPage) {
			currentModeView.city = city
		} else {
			this.trigger("newMode", new MapsPage({
				city: city
			}));
		}		
		
		app.view.mode = "maps";
	},
	stats: function(type) {
		
		if (!type) {
			return this.redirectTo("/stats/cycling");
		}
		
		const currentModeView = this.currentModeView;
		
		if (currentModeView instanceof StatsPage) {
			currentModeView.type = type
		} else {
			this.trigger("newMode", new StatsPage({
				type: type
			}));
		}		
		
		app.view.mode = "stats";
	}
});

module.exports = Router;