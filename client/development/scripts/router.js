//import app from "ampersand-app";
import AmpersandRouter from "ampersand-router";

//import StartPage from "./views/start";
//import StatsPage from "./views/stats";
//import MapsPage from "./views/maps";
//import MapsLegendPage from "./views/maps-legend";

import CoffeeStatsPage from "./views/stats_coffee";
import CyclingStatsPage from "./views/stats_cycling";
import BeerStatsPage from "./views/stats_beer";
//import HealthStatsPage from "./views/stats_health";

//const DEFAULT_TITLE = "Daniel's Twenty Seventeen";

const makeGeoJSONTextLabelForPoint = (text, point, size = 1) => ({
	type: "Feature",
	properties: {
		type: "text",
		text,
		size
	},
	geometry: {
		"type": "Point",
		"coordinates": point
	}
});

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
		const view = new CoffeeStatsPage({
			name: "coffee"
		});

		view.stats.add([
			{
				title: "Total coffees",
				data: {
					type: "numeric",
					value: 340.75
				}
			},
			{
				title: "Est. total volume (L)",
				data: {
					type: "numeric",
					value: 120.93
				}
			},
			{
				title: "Median daily coffees",
				data: {
					type: "numeric",
					value: 1
				}
			},
			{
				title: "Most coffees in one day",
				data: {
					type: "numeric",
					value: 2
				}
			},
			{
				title: "Days without coffee",
				data: {
					type: "numeric",
					value: 52
				}
			},
			{
				title: "Weekdays without coffee",
				data: {
					type: "numeric",
					value: 9
				}
			},
			{
				title: "Longest coffee streak (days)",
				data: {
					type: "numeric",
					value: 33
				}
			},
			{
				title: "Longest coffee streak (coffees)",
				data: {
					type: "numeric",
					value: 34
				}
			},
			{
				title: "Longest weekday coffee streak (days)",
				data: {
					type: "numeric",
					value: 75
				}
			},
			{
				title: "Longest weekday coffee streak (coffees)",
				data: {
					type: "numeric",
					value: 86
				}
			},
			{
				title: "Longest dry streak (days)",
				data: {
					type: "numeric",
					value: 2
				}
			},
			{
				title: "Longest weekend dry streak (days)",
				data: {
					type: "numeric",
					value: 7
				}
			},
			{
				title: "Days with more coffee than usual",
				data: {
					type: "numeric",
					value: 29
				}
			},
			{
				title: "Daily coffees",
				data: {
					type: "line",
					value: [1, 1, 1, 1, 1, 1, 1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 2, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 2, 0, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.25, 1, 1, 1, 1, 1, 1.5, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 2, 2, 2, 1, 2, 2, 1, 1, 1, 2, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 2, 1, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 2, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0]
				},
				wide: "xfull",
				tall: "y1"
			},
			{
				title: "Cumulative coffees",
				data: {
					type: "line",
					value: [1, 2, 3, 4, 5, 6, 7, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21, 22, 23, 24, 25, 26, 26, 27, 28, 29, 30, 31, 32, 33, 33, 34, 36, 37, 38, 39, 40, 41, 42, 44, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 64, 65, 67, 67, 68, 69, 70, 71, 72, 72, 73, 74, 75, 77, 78, 79, 80, 80, 81, 82, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 94, 94, 95, 96, 97, 98, 99, 99, 99, 101, 102, 103, 104, 105, 105, 106, 106, 107, 108, 109, 110, 112, 112, 113, 114, 115, 116, 117, 118, 118, 119, 121, 122, 123, 125, 126, 126, 127, 128, 129, 130, 131, 132, 133, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 143, 144, 145, 146, 147, 148, 149, 150, 150, 151, 152, 153, 154, 155, 156, 156, 156, 157, 158, 159, 160, 161, 162, 163, 165, 166, 167, 168, 169, 171, 171, 172, 173, 174, 175, 176, 176, 176, 177, 178, 179, 180, 181, 182, 182, 183, 184, 185, 186, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 203, 204, 205, 206, 207, 208, 209, 210, 211, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 224.25, 225.25, 226.25, 227.25, 228.25, 229.25, 230.75, 231.75, 232.75, 233.75, 234.75, 235.75, 236.75, 236.75, 237.75, 237.75, 238.75, 238.75, 239.75, 240.75, 241.75, 241.75, 242.75, 243.75, 244.75, 245.75, 246.75, 247.75, 247.75, 248.75, 249.75, 250.75, 252.75, 254.75, 256.75, 257.75, 259.75, 261.75, 262.75, 263.75, 264.75, 266.75, 266.75, 266.75, 267.75, 268.75, 269.75, 270.75, 270.75, 270.75, 271.75, 272.75, 273.75, 274.75, 275.75, 275.75, 275.75, 277.75, 278.75, 280.75, 281.75, 282.75, 282.75, 282.75, 283.75, 284.75, 285.75, 286.75, 287.75, 288.75, 288.75, 289.75, 290.75, 291.75, 292.75, 293.75, 293.75, 293.75, 294.75, 295.75, 296.75, 297.75, 297.75, 299.75, 299.75, 300.75, 301.75, 302.75, 303.75, 304.75, 304.75, 304.75, 305.75, 306.75, 307.75, 308.75, 309.75, 309.75, 310.75, 311.75, 312.75, 313.75, 314.75, 315.75, 316.75, 317.75, 318.75, 319.75, 320.75, 321.75, 322.75, 323.75, 323.75, 324.75, 325.75, 326.75, 327.75, 328.75, 329.75, 329.75, 330.75, 331.75, 332.75, 333.75, 334.75, 335.75, 336.75, 336.75, 336.75, 337.75, 338.75, 339.75, 340.75, 340.75]
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Top coffee shops",
				data: {
					type: "percentage",
					value: [
						["Hopper", 24],
						["Manic", 19],
						["Voodoo Child", 14],
						["Pamenar", 4],
						["Jimmy's", 3]
					]
				},
				tall: "y2"
			},
			{
				title: "Average coffees per day of week",
				data: {
					type: "bar",
					value: [
						{label: "Mon", value: 1.02},
						{label: "Tue", value: 1.10},
						{label: "Web", value: 1.08},
						{label: "Thr", value: 1.04},
						{label: "Fri", value: 1.00},
						{label: "Sat", value: 0.84},
						{label: "Sun", value: 0.47}
					]
				},
				wide: "x2"
			}
		]);

		this.trigger("newPage", view);
		this.trigger("navigation");
	},
	cycling() {
		const view = new CyclingStatsPage({
			name: "cycling"
		});

		view.stats.add([
			{
				title: "Total distance (km)",
				data: {
					type: "numeric",
					value: 3662
				}
			},
			{
				title: "Total rides",
				data: {
					type: "numeric",
					value: 778
				}
			},
			{
				title: "Total time (hrs)",
				data: {
					type: "numeric",
					value: 183.4
				}
			},
			{
				title: "Number of riding days",
				data: {
					type: "numeric",
					value: 290
				}
			},
			{
				title: "Longest riding streak (days)",
				data: {
					type: "numeric",
					value: 35
				}
			},
			{
				title: "Longest no-riding streak (days)",
				data: {
					type: "numeric",
					value: 9
				}
			},
			{
				title: "Toronto rides",
				data: {
					type: "map",
					value: {
						layers: [
							{
								uri: "/data/lake-ontario-coastline.geojson"
							},
							{
								uri: "/data/ytz-airport-grounds.geojson"
							},
							{
								uri: "/data/yyz-airport-grounds.geojson"
							},
							{
								uri: "/data/2017_rides_toronto.geojson"
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Toronto", [-79.383558, 43.652503])
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Hamilton", [-79.866091, 43.250021], 0.75)
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Mississauga", [-79.65, 43.6], 0.75)
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Oakville", [-79.687666, 43.467517], 0.5)
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Burlington", [-79.8, 43.316667], 0.5)
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Vaughan", [-79.5, 43.83333], 0.5)
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Newmarket", [-79.466667, 44.05], 0.5)
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Niagara Falls", [-79.106667, 43.06], 0.5)
							}
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
				title: "Sydney rides",
				data: {
					type: "map",
					value: {
						layers: [
							{
								uri: "/data/sydney-coastline.geojson"
							},
							{
								uri: "/data/2017_rides_sydney.geojson"
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Sydney", [151.212222, -33.868056])
							}
						],
						center: [151.230278, -33.868056],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Melbourne rides",
				data: {
					type: "map",
					value: {
						layers: [
							{
								uri: "/data/melbourne-coastline.geojson"
							},
							{
								uri: "/data/2017_rides_melbourne.geojson"
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Melbourne", [144.963, -37.814])
							}
						],
						center: [144.963, -37.837],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Auckland rides",
				data: {
					type: "map",
					value: {
						layers: [
							{
								uri: "/data/auckland-coastline.geojson"
							},
							{
								uri: "/data/2017_rides_auckland.geojson"
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Auckland", [174.765, -36.847])
							}
						],
						center: [174.81, -36.8675],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Top daily distance (km)",
				data: {
					type: "numeric",
					value: 114.69
				}
			},
			{
				title: "Top weekly distance (km)",
				data: {
					type: "numeric",
					value: 253.6
				}
			},
			{
				title: "Greatest peak distance from ride start (km)",
				data: {
					type: "numeric",
					value: 67.58
				}
			},
			{
				title: "Median daily distance (km)",
				data: {
					type: "numeric",
					value: 4.54
				}
			},
			{
				title: "Total elevation gain (m)",
				data: {
					type: "numeric",
					value: 15982
				}
			},
			{
				title: "Est. total energy (kcal)",
				data: {
					type: "numeric",
					value: 64100
				}
			},
			{
				title: "Montreal rides",
				data: {
					type: "map",
					value: {
						layers: [
							{
								uri: "/data/montreal-coastline.geojson"
							},
							{
								uri: "/data/2017_rides_montreal.geojson"
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Montreal", [-73.57, 45.5])
							}
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
				title: "Vancouver rides",
				data: {
					type: "map",
					value: {
						layers: [
							{
								uri: "/data/vancouver-green.geojson"
							},
							{
								uri: "/data/vancouver-coastline.geojson"
							},
							{
								uri: "/data/2017_rides_vancouver.geojson"
							},
							{
								geojson: makeGeoJSONTextLabelForPoint("Vancouver", [-123.1, 49.25])
							}
						],
						center: [-123.1, 49.285],
						minZoom: 19,
						startZoom: 20
					}
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Est. peak speed (km/h)",
				data: {
					type: "numeric",
					value: 68.76
				}
			},
			{
				title: "Highest average ride speed (km/h)",
				data: {
					type: "numeric",
					value: 32.70
				}
			},
			{
				title: "Lowest average ride speed (km/h)",
				data: {
					type: "numeric",
					value: 8.41
				}
			},
			{
				title: "Median average ride speed (km/h)",
				data: {
					type: "numeric",
					value: 18.88
				}
			},
			{
				title: "Rides per month",
				data: {
					type: "bar",
					value: [
						{label: "Jan", value: 56},
						{label: "Feb", value: 35},
						{label: "Mar", value: 42},
						{label: "Apr", value: 71},
						{label: "May", value: 86},
						{label: "Jun", value: 74},
						{label: "Jul", value: 83},
						{label: "Aug", value: 91},
						{label: "Sep", value: 69},
						{label: "Oct", value: 68},
						{label: "Nov", value: 63},
						{label: "Dec", value: 33}
					]
				},
				wide: "x2",
				tall: "y1"
			},
			{
				title: "Distance per month (km)",
				data: {
					type: "bar",
					value: [
						{label: "Jan", value: 122.14},
						{label: "Feb", value: 180.13},
						{label: "Mar", value: 112.61},
						{label: "Apr", value: 496.87},
						{label: "May", value: 274.00},
						{label: "Jun", value: 414.51},
						{label: "Jul", value: 456.60},
						{label: "Aug", value: 529.50},
						{label: "Sep", value: 352.37},
						{label: "Oct", value: 379.61},
						{label: "Nov", value: 185.99},
						{label: "Dec", value: 157.50}
					]
				},
				wide: "x2",
				tall: "y1"
			},
			{
				title: "Weekly rides",
				wide: "x2",
				data: {
					type: "line",
					value: [11, 10, 15, 12, 19, 1, 14, 8, 1, 13, 1, 16, 15, 18, 11, 20, 15, 22, 20, 21, 18, 22, 16, 16, 15, 18, 21, 19, 20, 15, 21, 17, 27, 15, 21, 19, 18, 15, 11, 21, 12, 17, 13, 13, 14, 17, 14, 14, 15, 4, 10]
				}
			},
			{
				title: "Weekly distances",
				wide: "x2",
				data: {
					type: "line",
					value: [25.6601, 24.1133, 33.49, 21.482, 45.0935, 38.4778, 35.39, 25.96, 52.58, 32.6422, 2.211, 52.1354, 81.7957, 133.04, 59.13, 130.67, 81.3484, 89.9582, 87.15, 57.0851, 57.10, 94.3857, 67.05, 95.90, 150.1555, 44.4894, 99.49, 112.7891, 96.3119, 121.32, 86.04, 69.42, 253.65, 53.3013, 91.79, 120.86, 97.7202, 75.0552, 42.3963, 176.8607, 78.162, 43.8793, 71.05, 55.21, 39.8437, 36.7943, 41.93, 44.82, 69.8195, 34.45, 30.2618]
				}
			},
			{
				title: "Average rides per day of week",
				data: {
					type: "bar",
					value: [
						{label: "Mon", value: 2.23},
						{label: "Tue", value: 2.17},
						{label: "Wed", value: 2.58},
						{label: "Thr", value: 2.27},
						{label: "Fri", value: 2.33},
						{label: "Sat", value: 1.83},
						{label: "Sun", value: 1.42}
					]
				},
				wide: "x2",
				tall: "y1"
			},
			{
				title: "Average distance per day of week",
				data: {
					type: "bar",
					value: [
						{label: "Mon", value: 8.40},
						{label: "Tue", value: 5.22},
						{label: "Wed", value: 7.64},
						{label: "Thr", value: 5.38},
						{label: "Fri", value: 6.69},
						{label: "Sat", value: 19.82},
						{label: "Sun", value: 17.29}
					]
				},
				wide: "x2",
				tall: "y1"
			}
		]);

		this.trigger("newPage", view);
		this.trigger("navigation");
	},
	beer() {
		const view = new BeerStatsPage({
			name: "beer"
		});

		view.stats.add([
			{
				title: "Total beer servings",
				data: {
					type: "numeric",
					value: 910
				}
			},
			{
				title: "Top beers",
				data: {
					type: "percentage",
					value: [
						["Octopus Wants to Fight - Great Lakes Brewery", 7],
						["Cutting Bells - Bellwoods Brewery", 6],
						["Guava Milkshark - Bellwoods Brewery", 5],
						["Ghost Orchid - Bellwoods Brewery", 4],
						["Hawaiian Uppercut - Stack Brewing", 4],
						["Cidre de Normandie - Le Père Jules", 4],
						["BUMO (ver. II) - Burdock", 3],
						["Barn Raiser Country Ale - Oast House Brewers", 3],
						["Blackcap Raspberry - Cascade Brewery", 3],
						["Runes (Citra & Mosaic) - Bellwoods Brewery", 3],
						["Schöfferhofer Grapefruit - Radeberger Gruppe", 3]
					]
				},
				wide: "x2",
				tall: "y2"
			},
			{
				title: "Top main beer styles",
				data: {
					type: "percentage",
					value: [
						["India Pale Ale", 248],
						["Sour", 140],
						["Pale Ale", 103],
						["Saison", 86],
						["Stout", 68],
						["Lager", 26],
						["Porter", 22],
						["Wild Ale", 17],
						["Cider", 16],
						["Blonde Ale", 16],
						["Witbier", 15],
						["Pilsner", 15],
						["Lambic", 14],
						["Red Ale", 13],
						["Hefeweizen", 13],
						["Brown Ale", 10],
						["Belgian Strong Golden Ale", 9],
						["Belgian Tripel", 8],
						["Pale Wheat Ale", 7],
						["Fruit Beer", 7]
					]
				},
				wide: "x1",
				tall: "y3"
			},/*
			{
				title: "Top specific styles",
				data: {
					type: "percentage",
					value: [
						["American India Pale Ale", 102],
						["Sour Ale", 68],
						["Saison", 63],
						["American Pale Ale", 63],
						["Imperial India Pale Ale", 25],
						["India Session Ale", 17],
						["Gose", 15],
						["Witbier", 13],
						["Berliner Weisse", 11],
						["American Imperial Stout", 10],
						["Blonde Ale", 9],
						["Red Ale", 9],
						["Black India Pale Ale", 9],
						["Hefeweizen", 9],
						["Wild Ale", 8],
						["Belgian Strong Golden Ale", 8],
						["Russian Imperial Stout", 8],
						["Belgian Tripel", 7],
						["Lager", 6],
						["Cider", 6],
						["Pale Wheat Ale", 6],
						["Porter", 6],
						["Australian Pale Ale", 6],
						["English Pale Ale", 5],
						["Lambic (traditional)", 5],
						["International Pale Ale", 5],
						["Stout", 5],
						["Gueuze", 5],
						["English IPA", 5],
						["Milk Stout", 5]
					]
				}
			},*/
			{
				title: "Total unique beers",
				data: {
					type: "numeric",
					value: 809
				}
			},
			{
				title: "Beers enjoyed more than once",
				data: {
					type: "numeric",
					value: 78
				}
			},
			{
				title: "Beers enjoyed more than twice",
				data: {
					type: "numeric",
					value: 11
				}
			},
			{
				title: "Total breweries",
				data: {
					type: "numeric",
					value: 281
				}
			},
			{
				title: "Beer servings per month",
				data: {
					type: "bar",
					value: [
						{label: "Jan", value: 77},
						{label: "Feb", value: 120},
						{label: "Mar", value: 64},
						{label: "Apr", value: 78},
						{label: "May", value: 73},
						{label: "Jun", value: 75},
						{label: "Jul", value: 69},
						{label: "Aug", value: 69},
						{label: "Sep", value: 85},
						{label: "Oct", value: 72},
						{label: "Nov", value: 64},
						{label: "Dec", value: 64}
					]
				},
				wide: "x2",
				tall: "y1"
			},
			{
				title: "Avg. beer servings per day of week",
				data: {
					type: "bar",
					value: [
						{label: "Mon", value: 1.7924528301886793},
						{label: "Tue", value: 2.4423076923076925},
						{label: "Wed", value: 2.1538461538461537},
						{label: "Thr", value: 2.3846153846153846},
						{label: "Fri", value: 2.75},
						{label: "Sat", value: 3.3076923076923075},
						{label: "Sun", value: 2.5849056603773586}
					]
				}
			},
			{
				title: "Days without a beer",
				data: {
					type: "numeric",
					value: 33
				}
			},
			{
				title: "Median beer servings per day",
				data: {
					type: "numeric",
					value: 2
				}
			},
			{
				title: "Days with more beer servings than usual",
				data: {
					type: "numeric",
					value: 143
				}
			},
			{
				title: "Longest streak (days)",
				data: {
					type: "numeric",
					value: 42
				}
			},
			{
				title: "Longest dry streak",
				data: {
					type: "numeric",
					value: 2
				}
			},
			{
				title: "Daily beer servings",
				data: {
					type: "line",
					value: [2,1,0,1,0,3,4,2,2,2,1,1,4,10,8,2,1,6,2,0,1,4,1,3,2,3,1,1,2,2,1,4,1,4,1,0,3,1,5,6,5,9,4,3,4,2,4,14,5,5,5,3,8,6,1,9,5,4,3,2,1,4,4,5,2,2,1,5,4,1,2,3,4,1,2,3,1,0,1,1,4,2,1,1,1,1,1,1,2,0,1,13,4,1,1,1,2,3,3,1,0,9,1,3,1,1,5,0,4,2,1,3,1,1,3,1,6,3,3,0,1,2,2,1,6,1,3,1,7,2,2,1,4,3,1,4,2,1,4,0,6,0,2,1,4,2,5,1,2,1,1,1,5,2,4,0,1,2,2,4,7,5,0,5,1,4,2,2,4,0,2,2,3,0,5,1,0,3,4,1,4,3,3,5,3,2,0,1,1,4,1,1,4,1,4,3,2,0,2,2,2,1,3,0,2,2,1,1,3,4,6,1,1,3,2,2,3,2,4,1,8,0,3,3,5,3,1,1,1,1,4,3,1,2,0,0,2,2,3,2,1,4,1,1,2,1,0,1,3,2,1,4,3,1,2,2,5,4,2,3,2,1,5,3,5,7,3,4,5,0,1,1,12,0,0,4,2,5,4,2,3,2,0,2,3,1,4,2,0,1,0,2,2,11,2,1,2,1,3,6,3,1,0,3,1,2,1,4,2,4,2,2,1,3,2,1,1,1,2,6,1,4,5,2,1,0,2,3,2,2,1,2,1,2,2,3,3,2,3,1,3,2,4,1,1,3,1,1,3,0,3,2,2,0,1,5,3,5,2,2,1,1,1,1,1,2]
				},
				wide: "xfull",
				tall: "y2"
			},
			{
				title: "Top bars (by servings)",
				data: {
					type: "percentage",
					value: [
						["Birreria Volo", 27],
						["Sonic Café", 26],
						["Bellwoods Brewery (Ossington)", 15],
						["Bar Hop Brewco", 13],
						["Bellwoods Brewery (Hafis)", 11],
						["Burdock", 11],
						["The Greater Good Bar", 11],
						["Otto's Bierhalle", 9],
						["Tequila Bookworm", 8],
						["The Get Well", 8],
						["C'est What?", 8],
						["Bryden's Pub", 7],
						["Young Henrys", 7],
						["Stomping Ground Brewery & Beer Hall", 7],
						["Galbraith's Alehouse", 7],
						["Brothers Beer", 7],
						["Snakes & Lattes (College)", 6],
						["Batch Brewing Company", 6],
						["MERIT Brewing", 6],
						["Wenona Lodge", 6],
						["Bar Hop", 6],
						["Trinity Common", 6],
						["Folly Brewpub", 6],
						["16 Tun", 6],
						["Good George Brew Pub", 5]
					]
				},
				wide: "x1",
				tall: "y3"
			},/*
			{
				title: "Average daily volume (mL)",
				data: {
					type: "numeric",
					value: 413
				}
			/,*/
			{
				title: "Most beer servings in one day",
				data: {
					type: "numeric",
					value: 14
				}
			},
			{
				title: "Most beer servings in one week",
				data: {
					type: "numeric",
					value: 37
				}
			},
			{
				title: "Top breweries by servings",
				data: {
					type: "percentage",
					value: [
						["Bellwoods Brewery", 100],
						["Burdock", 50],
						["Great Lakes Brewery", 32],
						["Folly Brewpub", 26],
						["Blood Brothers Brewing", 21],
						["Halo Brewery", 18],
						["Indie Alehouse", 17],
						["Half Hours on Earth", 16],
						["Rainhard Brewing", 15],
						["Sawdust City Brewing Co.", 14],
						["Dominion City Brewing Co.", 13],
						["Collective Arts Brewing", 12],
						["Left Field Brewery", 12],
						["Nickel Brook Brewing Co.", 12],
						["Flying Monkeys Craft Brewery", 10],
						["Stack Brewing", 10],
						["Shacklands Brewing Company", 10],
						["Forked River Brewing Company", 10],
						["Beau's All Natural Brewing Company ", 9],
						["Brasserie Cantillon", 9],
						["Batch Brewing Company", 8],
						["Amsterdam Brewing Company (Canada)", 8],
						["Wellington Brewery", 8],
						["Stomping Ground Brewing Co", 7],
						["Godspeed Brewery", 7],
						["Rouge River Brewing Company", 7],
						["Young Henrys Brewing Company", 7],
						["Cascade Brewery", 6],
						["MERIT Brewing", 6],
						["Bench Brewing Company", 6],
						["Niagara Oast House Brewers", 6],
						["Le Trou du Diable", 5],
						["Oskar Blues Brewery", 5]
					]
				},
				wide: "x1",
				tall: "y3"
			},
			{
				title: "Top bottle shops by servings",
				data: {
					type: "percentage",
					value: [
						["Bellwoods Brewery (Ossington)", 47],
						["Burdock", 23],
						["Folly", 10],
						["Halo Brewery", 9],
						["Blood Brothers Brewing", 8],
						["Rainhard Brewing", 7],
						["Indie Alehouse", 7],
						["LCBO (Summerhill)", 7],
						["Purvis Beer", 6],
						["Great Lakes Brewery", 6],
						["Bellwoods Brewery (Hafis)", 6],
						["Shacklands Brewing Company", 5],
						["LCBO (Dundas & Dovercourt)", 5],
						["Left Field Brewery", 5],
						["Slow Beer", 4],
						["Kensington Brewing Company", 4],
						["Dépanneur Peluso", 4],
						["Godspeed Brewery", 3],
						["Legacy Liquor Store", 3],
						["Amsterdam Brewery", 2],
						["Market Brewing Company", 2],
						["LCBO (Spadina & Dundas)", 2]
					]
				},
				wide: "x1",
				tall: "y3"
			},
			{
				title: "Top serving styles by servings",
				data: {
					type: "percentage",
					value: [
						["Bottle", 282],
						["Draft", 209],
						["Can", 140],
						["Cask", 18],
						["Nitro", 6],
						["Growler", 4],
						["Crowler", 2]
					]
				},
				wide: "x1",
				tall: "y2"
			},
			{
				title: "Top brewery cities by beer servings",
				data: {
					type: "percentage",
					value: [
						["Toronto (CA)", 327],
						["Etobicoke (CA)", 36],
						["Auckland (NZ)", 23],
						["Ottawa (CA)", 22],
						["Guelph (CA)", 20],
						["Hamilton (CA)", 18],
						["Seaforth (CA)", 16],
						["Gravenhurst (CA)", 14],
						["Barrie (CA)", 13],
						["London (CA)", 11],
						["Marrickville (AU)", 11],
						["Sudbury (CA)", 10],
						["Bruxelles (BE)", 9],
						["Vankleek Hill (CA)", 9],
						["Vancouver (CA)", 9],
						["Collingwood (AU)", 8],
						["Niagara-on-the-Lake (CA)", 8],
						["Burlington (CA)", 7],
						["Newtown (AU)", 7],
						["Markham (CA)", 7],
						["Brooklyn (US)", 7],
						["Portland, OR (US)", 7],
						["Wellington (NZ)", 6],
						["Beamsville (CA)", 6],
						["Shawinigan (CA)", 6],
						["Longmont (US)", 5],
						["Hamilton (NZ)", 5],
						["Kingston (CA)", 5],
						["St-Jérôme (CA)", 5],
						["Melbourne (AU)", 4],
						["Baskerville (US)", 4],
						["New Plymouth (NZ)", 4],
						["Matakana (NZ)", 3]
					]
				},
				wide: "x1",
				tall: "y3"
			},
			{
				title: "Top brewery countries by beer servings",
				data: {
					type: "percentage",
					value: [
						["Canada", 621],
						["Australia", 80],
						["United States", 66],
						["New Zealand", 58],
						["Belgium", 23],
						["Germany", 18],
						["France", 6],
						["Denmark", 6],
						["Scotland", 4],
						["England", 4],
						["Austria", 3],
						["Netherlands", 3],
						["Ireland", 3],
						["Sweden", 3],
						["Poland", 3],
						["Spain", 2],
						["Italy", 1],
						["Norway", 1],
						["Japan", 1],
						["Slovakia", 1]
					]
				},
				wide: "x1",
				tall: "y3"
			}
		]);

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
