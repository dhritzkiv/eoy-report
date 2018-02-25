import AmpersandRouter from "ampersand-router";

import StatsPage from "./views/stats";
import StartPage from "./views/start";

import {svg_coffee, svg_beer, svg_cycling, svg_health, svg_media, svg_walking} from "./utils/icons";

//const DEFAULT_TITLE = "Daniel's Twenty Seventeen";

const Router = AmpersandRouter.extend({
	routes: {
		"": "start",
		"coffee": "coffee",
		"cycling": "cycling",
		"walking": "walking",
		"media": "media",
		"beer": "beer",
		"health": "health"
	},
	start: function() {
		const view = new StartPage();

		this.trigger("newPage", view);
	},
	coffee() {
		const view = new StatsPage({
			name: "coffee",
			icon: svg_coffee
		});

		view.stats.url = "/data/stats_coffee.json";

		this.trigger("newPage", view);

		view.stats.fetch();
	},
	cycling() {
		const view = new StatsPage({
			name: "cycling",
			icon: svg_cycling
		});

		view.stats.url = "/data/stats_rides.json";

		this.trigger("newPage", view);

		view.stats.fetch();
	},
	beer() {
		const view = new StatsPage({
			name: "beer",
			icon: svg_beer
		});

		view.stats.url = "/data/stats_beer.json";

		this.trigger("newPage", view);

		view.stats.fetch();
	},
	walking() {
		const view = new StatsPage({
			name: "walking",
			icon: svg_walking
		});

		view.stats.url = "/data/stats_walking.json";

		this.trigger("newPage", view);

		view.stats.fetch();
	},/*
	maps() {
		const view = new StatsPage({
			name: "maps"
		});

		view.stats.add([
			{
				title: "Toronto activity",
				data: {
					type: "map",
					value: {
						extent: areas.toronto.extent,
						layers: [
							...areas.toronto.baseLayers,
							{
								uri: "/data/toronto-subway.geojson"
							},
							{
								uri: "/data/2017_rides_toronto.geojson"
							},
							{
								uri: "/data/2017_walks_toronto.geojson"
							},
							{
								uri: "/data/2017_checkins_toronto.geojson"
							},
							...areas.toronto.labelLayers
						],
						center: [-79.383558, 43.652503],
						minZoom: 18,
						startZoom: 20
					}
				},
				wide: "xfull",
				tall: "y3"
			},
			{
				title: "Sydney activity",
				data: {
					type: "map",
					value: {
						layers: [
							...areas.sydney.baseLayers,
							{
								uri: "/data/2017_rides_sydney.geojson"
							},
							{
								uri: "/data/2017_walks_sydney.geojson"
							},
							{
								uri: "/data/2017_checkins_sydney.geojson"
							},
							...areas.sydney.labelLayers
						],
						center: [151.22, -33.8715],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Melbourne activity",
				data: {
					type: "map",
					value: {
						layers: [
							...areas.melbourne.baseLayers,
							{
								uri: "/data/2017_rides_melbourne.geojson"
							},
							{
								uri: "/data/2017_walks_melbourne.geojson"
							},
							{
								uri: "/data/2017_checkins_melbourne.geojson"
							},
							...areas.melbourne.labelLayers
						],
						center: [144.963, -37.837],
						minZoom: 18,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Auckland activity",
				data: {
					type: "map",
					value: {
						extent: areas.auckland.extent,
						layers: [
							...areas.auckland.baseLayers,
							{
								uri: "/data/2017_rides_auckland.geojson"
							},
							{
								uri: "/data/2017_walks_auckland.geojson"
							},
							{
								uri: "/data/2017_checkins_auckland.geojson"
							},
							...areas.auckland.labelLayers
						],
						center: [174.795, -36.85],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Montreal activity",
				data: {
					type: "map",
					value: {
						extent: areas.montreal.extent,
						layers: [
							...areas.montreal.baseLayers,
							{
								uri: "/data/2017_rides_montreal.geojson"
							},
							{
								uri: "/data/2017_walks_montreal.geojson"
							},
							{
								uri: "/data/2017_checkins_montreal.geojson"
							},
							...areas.montreal.labelLayers
						],
						center: [-73.57, 45.5125],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Vancouver activity",
				data: {
					type: "map",
					value: {
						layers: [
							...areas.vancouver.baseLayers,
							{
								uri: "/data/2017_rides_vancouver.geojson"
							},
							{
								uri: "/data/2017_walks_vancouver.geojson"
							},
							{
								uri: "/data/2017_checkins_vancouver.geojson"
							},
							...areas.vancouver.labelLayers
						],
						center: [-123.1, 49.285],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			}
		]);

		this.trigger("newPage", view);
	},*/
	health() {
		const view = new StatsPage({
			name: "health",
			icon: svg_health
		});

		view.stats.url = "/data/stats_health.json";

		this.trigger("newPage", view);

		view.stats.fetch();
	},
	media() {
		const view = new StatsPage({
			name: "media",
			icon: svg_media
		});

		view.stats.url = "/data/stats_media.json";

		this.trigger("newPage", view);

		view.stats.fetch();
	}/*,
	places() {
		const view = new StatsPage({
			name: "places"
		});

		view.stats.add([
			{
				title: "Total visits",
				data: {
					type: "numeric",
					value: 1202
				}
			},
			{
				title: "Unique places",
				data: {
					type: "numeric",
					value: 550
				}
			},
			{
				title: "Average visits per day of week",
				data: {
					type: "bar",
					value: [
						{label: "Mon", value: 3},
						{label: "Tue", value: 3.5},
						{label: "Wed", value: 3.67},
						{label: "Thr", value: 3.37},
						{label: "Fri", value: 3.5},
						{label: "Sat", value: 3.69},
						{label: "Sun", value: 2.34}
					]
				},
				wide: "x1"
			},
			{
				title: "Longest no-visit streak (days)",
				data: {
					type: "numeric",
					value: 2
				}
			},
			{
				title: "Longest visit streak (days)",
				data: {
					type: "numeric",
					value: 114
				}
			},
			{
				title: "Longest visit streak (visits)",
				data: {
					type: "numeric",
					value: 428
				}
			},
			{
				title: "Visits by month",
				data: {
					type: "bar",
					value: [
						{label: "Jan", value: 94},
						{label: "Feb", value: 164},
						{label: "Mar", value: 93},
						{label: "Apr", value: 96},
						{label: "May", value: 102},
						{label: "Jun", value: 96},
						{label: "Jul", value: 115},
						{label: "Aug", value: 103},
						{label: "Sep", value: 108},
						{label: "Oct", value: 86},
						{label: "Nov", value: 77},
						{label: "Dec", value: 68}
					]
				},
				wide: "x2"
			},
			{
				title: "Top countries (visits)",
				data: {
					type: "percentage",
					value: [
						["Canada", 1033],
						["Australia", 100],
						["New Zealand", 61],
						["China", 5],
						["United States of America", 3]
					]
				},
				tall: "y2"
			},
			{
				title: "Top countries (places)",
				data: {
					type: "percentage",
					value: [
						["Canada", 377],
						["Australia", 87],
						["New Zealand", 56],
						["China", 4],
						["United States of America", 3]
					]
				},
				tall: "y2"
			},
			{
				title: "Top cities (visits)",
				data: {
					type: "percentage",
					value: [
						["Toronto", 955],
						["Sydney ", 55],
						["Auckland", 48],
						["Melbourne", 29],
						["Montreal", 13],
						["Mississauga", 10],
						["Vancouver", 9],
						["Oakville", 8],
						["Richmond, BC", 4],
						["Oro-Medonte", 4],
						["Hamilton, ON", 4],
						["Katoomba", 4],
						["Oneroa", 3],
						["Hamilton, NZ", 3],
						["Shanghai", 5],
						["Barrie", 2],
						["Squamish", 2],
						["Surrey, BC", 2],
						["Newmarket, ON", 2],
						["Ottawa", 2],
						["Bellingham", 2],
						["Hahei", 2]
					]
				},
				tall: "y2"
			},
			{
				title: "Top cities (places)",
				data: {
					type: "percentage",
					value: [
						["Toronto", 316],
						["Sydney", 47],
						["Auckland", 41],
						["Melbourne", 27],
						["Montreal", 13],
						["Mississauga", 9],
						["Vancouver", 8],
						["Katoomba", 4],
						["Oakville", 4],
						["Hamilton, ON", 3],
						["Richmond, BC", 3],
						["Newmarket, NZ", 3],
						["Hamilton, NZ", 3],
						["Oneroa", 3],
						["Shanghai", 2],
						["Hahei", 2],
						["Ottawa", 2],
						["Squamish", 2],
						["Bellingham", 2],
						["Surrey, BC", 2],
						["Barrie", 2],
						["Oro-Medonte", 2]
					]
				},
				tall: "y2"
			},
			{
				title: "Top categories (visits)",
				data: {
					type: "percentage",
					value: [
						["Café / Coffee Shop", 234],
						["Liquor Store", 71],
						["Bar / Pub", 144],
						["Misc. Restaurant", 80],
						["Brewery", 66],
						["Mexican", 48],
						["Park / Green Space", 32],
						["Bubble Tea Shop", 28],
						["Burger Joint", 25],
						["Cinema", 27],
						["Vietnamese Restaurant", 19],
						["Fried Chicken Joint", 15],
						["Burrito Place", 15],
						["Bakery", 14],
						["Airport", 13],
						["Barbershop", 12],
						["Kombucha Shop", 10],
						["Doner Restaurant", 12],
						["Dessert Shop", 12],
						["Butcher", 10],
						["Smoothie Shop", 10],
						["Sushi Restaurant", 9],
						["Ice Cream Shop", 9],
						["Tapas Restaurant", 8],
						["Bagel Shop", 8],
						["Furniture Store", 8],
						["Bike Shop", 8],
						["Beach", 8],
						["Juice Bar", 7],
						["Dim Sum Restaurant", 7],
						["Asian Restaurant", 7],
						["Concert Hall", 5],
						["Pizza Place", 5],
						["Donut Shop", 5],
						["Deli", 5],
						["Poutine Place", 5]
					]
				},
				tall: "y2"
			},
			{
				title: "Top burger places (visits)",
				data: {
					type: "percentage",
					value: [
						["The Burgernator", 5],
						["The Burger's Priest (Fashion District)", 4],
						["BQM Burger (Ossington)", 2],
						["A&W (College & Ossington)", 2]
					]
				},
				tall: "y2"
			},
			{
				title: "Top Mexican places (visits)",
				data: {
					type: "percentage",
					value: [
						["Seven Lives Tacos Y Mariscos", 23],
						["La Chilaca Taquira", 15],
						["Torteria San Cosme", 5]
					]
				},
				tall: "y1"
			}
		]);

		this.trigger("newPage", view);
	}*/
});

export default Router;
