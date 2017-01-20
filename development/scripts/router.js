"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const StartPage = require("./views/start");
const StatsPage = require("./views/stats");
const MapsPage = require("./views/maps");
const MapsLegendPage = require("./views/maps-legend");

const CyclingStatsPage = require("./views/stats_cycling");
const BeerStatsPage = require("./views/stats_beer");

const DEFAULT_TITLE = "Daniel's Twenty Fifteen";

const Router = AmpersandRouter.extend({
	initialize: function() {
		this.on("newMode", view => this.currentModeView = view);
	},
	routes: {
		"": "start",
		"cycling": "cycling",
		"walking": "walking",
		"audio-video": "av",
		"beer": "beer",
		//"maps": "maps",
		//"maps/:area_name": "maps",
		/*"maps/:area_name/legend": "mapsLegend",
		"stats": "stats",
		"stats/:type": "stats"*/
	},
	currentModeView: null,
	start: function() {
		this.trigger("newPage", new BeerStatsPage());
		this.trigger("navigation");
	},
	cycling() {
		this.trigger("newPage", new CyclingStatsPage());
		this.trigger("navigation");
	},
	_mapsBase: function(area_name) {

		let currentModeView = this.currentModeView;

		if (currentModeView instanceof MapsPage) {
			currentModeView.area_name = area_name;
		} else {
			currentModeView = new MapsPage({
				area_name: area_name
			});

			//this.trigger("newMode", currentModeView);
			this.trigger("newPage", currentModeView);
		}

		//document.title = `Map of ${currentModeView.area.name} - ${DEFAULT_TITLE}`;
		app.view.mode = "maps";

		return currentModeView;
	},
	maps: function(area_name) {

		if (!area_name) {
			if (this.currentModeView instanceof MapsPage) {
				area_name = this.currentModeView.area_name;
			} else {
				area_name = "to";
			}

			return this.redirectTo(`/maps/${area_name}`);
		}

		this._mapsBase(area_name);

		this.trigger("navigation");
	},
	/*mapsLegend: function(area_name) {

		const self = this;
		const currentModeView = this._mapsBase(area_name);

		function showOverlay() {
			const legendPage = new MapsLegendPage({
				area_name: area_name,
				parent: currentModeView
			});

			self.trigger("newOverlay", legendPage, currentModeView.query("canvas"));
		}

		if (currentModeView.rendered) {
			showOverlay();
		} else {
			currentModeView.once("change:rendered", showOverlay);
		}

		this.trigger("navigation");
	},
	stats: function(type) {

		if (!type) {
			return this.redirectTo("/stats/cycling");
		}

		let currentModeView = this.currentModeView;

		if (currentModeView instanceof StatsPage) {
			currentModeView.type = type;
		} else {
			currentModeView = new StatsPage({
				type: type
			});

			this.trigger("newMode", currentModeView);
		}

		document.title = `${currentModeView.model.title} stats - ${DEFAULT_TITLE}`;
		app.view.mode = "stats";

		this.trigger("navigation");
	}*/
	beer() {
		const view = new BeerStatsPage({});

		this.trigger("newPage", view);
		this.trigger("navigation");
	}
});

module.exports = Router;
