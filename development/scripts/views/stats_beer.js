"use strict";

const StatsView = require("./stats");
const xhr = require("xhr");

module.exports = StatsView.extend({
	template: `
		<section class="category beer">
			<header>
				<div class="art"></div>
				<div class="copy">
					<p></p>
				</div>
			</header>
			<main class="stats">
				<div class="stats-container">
					<div class="stat">
						<h3>Total Beers</h3>
						<h2>867</h2>
					</div>
					<div class="stat">
						<h3>Unique Beers</h3>
						<h2>659</h2>
					</div>
					<div class="stat">
						<h3>Est. Volume (L)</h3>
						<h2>332.11</h2><!--383.058431372549mL * 867-->
					</div>

					<div class="graph-holder full">
						<div class="divider"></div>
						<h3>Beers by Week</h3>
						<svg></svg>
						<div class="divider"></div>
					</div>

					<div class="stat">
						<h3>Breweries enjoyed</h3>
						<h2>202</h2>
					</div>
					<div class="stat">
						<h3>Longest streak (beers)</h3>
						<h2>199</h2>
					</div>
					<div class="stat">
						<h3>Longest dry spell (days)</h3>
						<h2>3</h2>
					</div>
				</div>

				<div class="list full">
					<h3>Top 5 Most Frequent Beers</h3>
					<ol>
						<li>(11) Octopus Wants to Fight - Great Lakes Brewery</li>
						<li>(06) Goose IPA - Goose Island</li>
						<li>(06) WitchShark - Bellwoods Brewery</li>
						<li>(05) Instigator IPA - Indie Ale House</li>
						<li>(05) Naughty Neighbour - Nickelbrook</li>
					</ol>
				</div>

				<div class="list full">
					<h3>Top 10 Most Frequent Breweries</h3>
					<ol>
						<li>(75) Bellwoods Brewery</li>
						<li>(70) Great Lakes Brewery</li>
						<li>(57) Burdock</li>
						<li>(29) Indie Ale House</li>
						<li>(28) Nickel Brook Brewing Co.</li>
						<li>(26) Halo Brewery</li>
						<li>(24) Beau's All Natural Brewing Company</li>
						<li>(23) Folly Brewpub</li>
						<li>(21) Rainhard Brewing</li>
						<li>(20) Left Field Brewery</li>
					</ol>
				</div>
			</main>
		</section>
	`,
	render() {
		this.renderWithTemplate();

		const graphContainer = this.query(".graph-holder");

		xhr({
			method: "GET",
			uri: "/data/weekly-beer-data.json",
			json: true
		}, (err, response, data) => {

			if (err) {
				return console.error(err);
			}

			requestAnimationFrame(() => this.buildChart(graphContainer, data));
		});

		return this;
	}
});
