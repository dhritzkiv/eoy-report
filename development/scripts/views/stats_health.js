"use strict";

const StatsView = require("./stats");
const xhr = require("xhr");

module.exports = StatsView.extend({
	template: `
		<section class="category sleep">
			<header>
				<div class="art"></div>
				<div class="copy">
					<p></p>
				</div>
			</header>
			<main class="stats">
				<div class="stats-container">
					<div class="stat">
						<h3>Avg. Sleep Duration (hrs)</h3>
						<h2>6:39:11</h2>
					</div>
					<div class="stat">
						<h3>Avg. Weekday Sleep Duration (hrs)</h3>
						<h2>6:20:16</h2>
					</div>
					<div class="stat">
						<h3>Avg. Weekend Sleep Duration (hrs)</h3>
						<h2>7:31:57</h2>
					</div>
					<div class="stat">
						<h3>Longest Sleep (hrs)</h3>
						<h2>10:53:38</h2>
					</div>
					<div class="stat">
						<h3>Shortest Sleep (hrs)</h3>
						<h2>1:24:34</h2>
					</div>
					<div class="stat">
						<h3>Total Nights Recorded</h3>
						<h2>326</h2>
					</div>
				</div>

				<div class="divider"></div>

				<div class="stats-container">
					<div class="stat">
						<h3>Avg. weight (lbs)</h3>
						<h2>159.99</h2>
					</div>
					<div class="stat">
						<h3>Greatest weight (lbs)</h3>
						<h2>168.70</h2>
					</div>
					<div class="stat">
						<h3>Lowest weight (lbs)</h3>
						<h2>159.80</h2>
					</div>
					<div class="stat">
						<h3>Weighings recorded</h3>
						<h2>74</h2>
					</div>
					<div class="stat">
						<h3>Greatest rate of change (lbs/hr)</h3>
						<h2>0.59</h2>
					</div>
				</div>
			</main>
		</section>
	`
});
