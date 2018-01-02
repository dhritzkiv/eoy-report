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
				},
				tall: "y2"
			},
			{
				title: "Coffees per day of week",
				data: {
					type: "bar",
					value: [
						{label: "Mon", value: 37},
						{label: "Tue", value: 40},
						{label: "Web", value: 39},
						{label: "Thr", value: 36},
						{label: "Fri", value: 36},
						{label: "Sat", value: 29.5},
						{label: "Sun", value: 19.25}
					]
				},
				wide: "x2"
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
					value: 910
				}
			},
			{
				title: "Top beers",
				data: {
					type: "percentage",
					value: [
						["Octopus Wants to Fight - Great Lakes Brewery", 7],
						["Cutting Bells", 6],
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
