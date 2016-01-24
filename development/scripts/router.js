"use strict";

const app = require("ampersand-app");
const AmpersandRouter = require("ampersand-router");

const StartPage = require("./views/start");
const StatsPage = require("./views/stats");
const MapsPage = require("./views/maps");
const MapsLegendPage = require("./views/maps-legend");

const DEFAULT_TITLE = "Daniel's Twenty Fifteen";

const Router = AmpersandRouter.extend({
	initialize: function() {
		this.on("newMode", view => this.currentModeView = view);
	},
	routes: {
		"": "start",
		"maps": "maps",
		"maps/:area_name": "maps",
		"maps/:area_name/legend": "mapsLegend",
		"stats": "stats",
		"stats/:type": "stats"
	},
	currentModeView: null,
	start: function() {
		
		this.trigger("newOverlay", new StartPage());
		
		document.title = DEFAULT_TITLE;
		
	},
	_mapsBase: function(area_name) {
		
		let currentModeView = this.currentModeView;
		
		if (currentModeView instanceof MapsPage) {
			currentModeView.area_name = area_name;
		} else {
			currentModeView = new MapsPage({
				area_name: area_name
			});
			
			this.trigger("newMode", currentModeView);
		}
		
		document.title = `Map of ${currentModeView.area.name} - ${DEFAULT_TITLE}`;
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
	},
	mapsLegend: function(area_name) {
		
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
	}
});

module.exports = Router;
