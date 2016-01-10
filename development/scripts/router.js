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
		"maps/:area_name": "maps",
		"stats": "stats",
		"stats/:type": "stats"
	},
	currentModeView: null,
	root: function() {
		this.navigate("/stats");
	},
	maps: function(area_name) {
		
		if (!area_name) {
			return this.redirectTo("/maps/to");
		}
		
		const currentModeView = this.currentModeView;
		
		if (currentModeView instanceof MapsPage) {
			currentModeView.area_name = area_name;
		} else {
			this.trigger("newMode", new MapsPage({
				area_name: area_name
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
			currentModeView.type = type;
		} else {
			this.trigger("newMode", new StatsPage({
				type: type
			}));
		}		
		
		app.view.mode = "stats";
	}
});

module.exports = Router;