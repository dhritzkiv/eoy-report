//import app from "ampersand-app";
import AmpersandRouter from "ampersand-router";

//import StartPage from "./views/start";
//import StatsPage from "./views/stats";
//import MapsPage from "./views/maps";
//import MapsLegendPage from "./views/maps-legend";

import CoffeeStatsPage from "./views/stats_coffee";
//import CyclingStatsPage from "./views/stats_cycling";
import BeerStatsPage from "./views/stats_beer";
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
		const view = new CoffeeStatsPage({
			name: "coffee"
		});

		view.stats.add([
			{
				title: "Total coffees",
				data: {
					type: "numeric",
					value: 324
				}
			},
			{
				title: "Cumulative coffees",
				data: {
					type: "line",
					value: [1, 2, 3, 4, 5, 6, 7, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21, 22, 23, 24, 25, 26, 26, 27, 28, 29, 30, 31, 32, 33, 33, 34, 36, 37, 38, 39, 40, 41, 42, 44, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 64, 65, 67, 67, 68, 69, 70, 71, 72, 72, 73, 74, 75, 77, 78, 79, 80, 80, 81, 82, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 94, 94, 95, 96, 97, 98, 99, 99, 99, 101, 102, 103, 104, 105, 105, 106, 106, 107, 108, 109, 110, 112, 112, 113, 114, 115, 116, 117, 118, 118, 119, 121, 122, 123, 125, 126, 126, 127, 128, 129, 130, 131, 132, 133, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 143, 144, 145, 146, 147, 148, 149, 150, 150, 151, 152, 153, 154, 155, 156, 156, 156, 157, 158, 159, 160, 161, 162, 163, 165, 166, 167, 168, 169, 171, 171, 172, 173, 174, 175, 176, 176, 176, 177, 178, 179, 180, 181, 182, 182, 183, 184, 185, 186, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 203, 204, 205, 206, 207, 208, 209, 210, 211, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 236, 237, 237, 238, 238, 239, 240, 241, 241, 242, 243, 244, 245, 246, 247, 247, 248, 249, 250, 252, 254, 256, 257, 259, 261, 262, 263, 264, 266, 266, 266, 267, 268, 269, 270, 270, 270, 271, 272, 273, 274, 275, 275, 275, 277, 278, 280, 281, 282, 282, 282, 283, 284, 285, 286, 287, 288, 288, 289, 290, 291, 292, 293, 293, 293, 294, 295, 296, 297, 297, 299, 299, 300, 301, 302, 303, 304, 304, 304, 305, 306, 307, 308, 309, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323]
				},
				wide: "xfull",
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
				}
			},
			{
				title: "Coffees per day of week",
				data: {
					type: "bar",
					value: /*[0,1,2,1,1,1,0,1,4,0,3,2,1,1,2,1,2,4,2,2,1,3,0,0,2,1,3,2,3,1,1,1,1,0,0,3,1,2,2,0,0,1,4,1,1,1,2,1,1,3,4,2,1,0,1,1,1,1,1,0,2,0,2,0,0,0,4,0,1,1,3,1,2,2,4,2,2,2,0,2,3,0,1,2,3,1,1,1,2,1,1,3,1,2,2,5,1,4,3,1,3,1,1,3,4,2,8,1,2,4,0,1,8,1,1,1,2,4,3,3,2,10,2,1,2,2,1,7,4,1,2,1,6,2,3,1,3,2,4,4,7,4,3,3,1,2,2,2,4,0,0,7,4,1,9,0,4,2,1,2,4,6,3,3,1,1,2,3,3,1,3,3,4,1,1,4,3,6,2,4,2,5,2,2,4,2,2,3,3,4,1,3,1,2,7,3,4,1,2,2,0,3,2,4,6,3,1,4,1,4,5,2,5,3,2,2,2,4,2,3,1,2,2,9,2,1,3,1,3,3,3,4,5,2,1,1,5,4,2,2,3,2,3,1,2,9,2,7,3,2,5,4,2,1,2,1,3,0,3,6,4,5,3,4,1,1,3,2,1,1,2,2,8,2,5,5,1,2,2,2,3,1,2,2,1,7,2,2,5,1,2,3,5,1,1,12,2,1,1,2,2,7,2,1,1,2,2,1,5,1,4,5,3,4,1,1,1,4,2,1,1,5,4,1,2,1,2,2,2,1,5,2,0,2,2,6,1,6,2,1,8,2,1,1,1,3,3,0,1,1,2,2,1,2,0,4,1,1,1,2,1,4,0,0,1,2,5]*/[37,40,39,36,36,29.5,19.25]
				}
			}
		]);

		this.trigger("newPage", view);
		this.trigger("navigation");
	},
	cycling() {
		const view = new CyclingStatsPage();

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
					value: 656
				}
			},
			{
				title: "Top beers",
				data: {
					type: "percentage",
					value: [
						["Octopus Wants to Fight - Great Lakes Brewery", 7],
						["Hawaiian Uppercut - Stack Brewing", 4],
						["Guava Milkshark - Bellwoods Brewery", 4],
						["BUMO (ver. II) - Burdock", 3],
						["Barn Raiser Country Ale - Oast House Brewers", 3]
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
						["India Pale Ale", 124],
						["Sour", 103],
						["Pale Ale", 85],
						["Saison", 63],
						["Stout", 46],
						["Lager", 17],
						["Lambic", 14],
						["Witbier", 13],
						["Porter", 13],
						["Blonde Ale", 12],
						["Red Ale", 11],
						["Pilsner", 10],
						["Hefeweizen", 9],
						["Wild Ale", 8],
						["Belgian Strong Golden Ale", 8],
						["Belgian Tripel", 7],
						["Pale Wheat Ale", 6],
						["Cider", 6],
						["Brown Ale", 5],
						["Belgian Quad", 4]
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
					value: 590
				}
			},
			{
				title: "Total breweries",
				data: {
					type: "numeric",
					value: 207
				}
			},
			{
				title: "Beers enjoyed more than once",
				data: {
					type: "numeric",
					value: 55
				}
			},
			{
				title: "Beers enjoyed more than twice",
				data: {
					type: "numeric",
					value: 5
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
						{label: "Sep", value: 31},
						{label: "Oct", value: 31},
						{label: "Nov", value: 31},
						{label: "Dec", value: 31}
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
						{label: "Mon", value: 1.489795918367347},
						{label: "Tue", value: 1.9795918367346939},
						{label: "Wed", value: 1.6122448979591837},
						{label: "Thr", value: 1.7346938775510203},
						{label: "Fri", value: 2.142857142857143},
						{label: "Sat", value: 2.36734693877551},
						{label: "Sun", value: 2.02}
					]
				}
			},
			{
				title: "Days without a beer",
				data: {
					type: "numeric",
					value: 109
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
					value: 157
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
					value: 86
				}
			},
			{
				title: "Daily beer servings",
				data: {
					type: "line",
					value: [2,1,0,1,0,3,4,2,2,2,1,1,4,10,8,2,1,6,2,0,1,4,1,3,2,3,1,1,2,2,1,4,1,4,1,0,3,1,5,6,5,9,4,3,4,2,4,14,5,5,5,3,8,6,1,9,5,4,3,2,1,4,4,5,2,2,1,5,4,1,2,3,4,1,2,3,1,0,1,1,4,2,1,1,1,1,1,1,2,0,1,13,4,1,1,1,2,3,3,1,0,9,1,3,1,1,5,0,4,2,1,3,1,1,3,1,6,3,3,0,1,2,2,1,6,1,3,1,7,2,2,1,4,3,1,4,2,1,4,0,6,0,2,1,4,2,5,1,2,1,1,1,5,2,4,0,1,2,2,4,7,5,0,5,1,4,2,2,4,0,2,2,3,0,5,1,0,3,4,1,4,3,3,5,3,2,0,1,1,4,1,1,4,1,4,3,2,0,2,2,2,1,3,0,2,2,1,1,3,4,6,1,1,3,2,2,3,2,4,1,8,0,3,3,5,3,1,1,1,1,4,3,1,2,0,0,2,2,3,2,1,4,1,1,2,1,0,1,3,2,1,4,3,1,2,2,5,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
				},
				wide: "xfull",
				tall: "y2"
			},
			{
				title: "Top bars (by servings)",
				data: {
					type: "percentage",
					value: [
						["Sonic Café", 20],
						["Birreria Volo", 17],
						["Bellwoods Brewery", 15],
						["Bar Hop Brewco", 10],
						["Burdock", 10],
						["Otto's Bierhalle", 9],
						["Tequila Bookworm", 8],
						["Bryden's Pub", 7],
						["The Greater Good Bar", 7],
						["Young Henrys", 7],
						["Stomping Ground Brewery & Beer Hall", 7],
						["Galbraith's Alehouse", 7],
						["Brothers Beer", 7],
						["Batch Brewing Company", 6],
						["MERIT Brewing", 6],
						["Wenona Lodge", 6],
						["Bar Hop", 6],
						["Trinity Common", 6],
						["16 Tun", 6],
						["Good George Brew Pub", 5]
					]
				},
				wide: "x1",
				tall: "y3"
			},
			{
				title: "Average daily volume (mL)",
				data: {
					type: "numeric",
					value: 413
				}
			},
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
						["Bellwoods Brewery", 65],
						["Burdock", 36],
						["Great Lakes Brewery", 17],
						["Half Hours on Earth", 16],
						["Sawdust City Brewing Co.", 12],
						["Blood Brothers Brewing", 11],
						["Stack Brewing", 10],
						["Left Field Brewery", 10],
						["Indie Alehouse", 10],
						["Collective Arts Brewing", 9],
						["Beau's All Natural Brewing Company ", 9],
						["Forked River Brewing Company", 9],
						["Flying Monkeys Craft Brewery", 9],
						["Brasserie Cantillon", 9],
						["Amsterdam Brewing Company (Canada)", 8],
						["Batch Brewing Company", 8],
						["Wellington Brewery", 7],
						["Stomping Ground Brewing Co", 7],
						["Nickel Brook Brewing Co.", 7],
						["Godspeed Brewery", 7],
						["Rouge River Brewing Company", 7],
						["Young Henrys Brewing Company", 7],
						["MERIT Brewing", 6],
						["Rainhard Brewing", 6],
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
				title: "Top brewery cities by beer servings",
				data: {
					type: "percentage",
					value: [
						["Toronto (CA)", 225],
						["Etobicoke (CA)", 28],
						["Auckland (NZ)", 23],
						["Hamilton (CA)", 15],
						["Seaforth (CA)", 16],
						["Guelph (CA)", 12],
						["Gravenhurst (CA)", 12],
						["Barrie (CA)", 12],
						["Collingwood (AU)", 11],
						["Marrickville (AU)", 11],
						["Sudbury (CA)", 10],
						["Bruxelles (BE)", 9],
						["Vankleek Hill (ON)", 9],
						["London (CA)", 9],
						["Niagara-on-the-Lake (CA)", 7],
						["Burlington (CA)", 7],
						["Newtown (AU)", 7],
						["Markham (CA)", 7],
						["Wellington (NZ)", 6],
						["Beamsville (CA)", 6],
						["Ottawa (CA)", 6],
						["Longmont (US)", 5],
						["Hamilton (NZ)", 5],
						["Shawinigan (CA)", 5],
						["Melbourne (AU)", 4],
						["St-Jérôme (CA)", 4],
						["Baskerville (US)", 4],
						["New Plymouth (NZ)", 4],
						["Kingston (ON)", 4],
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
						["Canada", 422],
						["Australia", 80],
						["New Zealand", 58],
						["United States", 35],
						["Belgium", 20],
						["Germany", 12],
						["Scotland", 4],
						["France", 4],
						["Denmark", 4],
						["Austria", 3],
						["England", 3],
						["Netherlands", 2],
						["Ireland", 2],
						["Sweden", 2],
						["Italy", 1],
						["Spain", 1],
						["Norway", 1],
						["Poland", 1],
						["Japan", 1]
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
