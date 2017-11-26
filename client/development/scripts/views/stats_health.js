import StatsView from "./stats";

const HealthStatsPageView = StatsView.extend({
	template: `
		<section class="category health">
			<header>
				<div class="art"></div>
				<div class="copy">
					<p></p>
				</div>
			</header>
			<main class="stats">
				<div class="stats-container">
					<header>
						<h2>Sleep</h2>
					</header>
					<div class="stat">
						<h3>Average duration (hrs)</h3>
						<h2>6:39:11</h2>
					</div>
					<div class="stat">
						<h3>Average weekday duration (hrs)</h3>
						<h2>6:20:16</h2>
					</div>
					<div class="stat">
						<h3>Average weekend duration (hrs)</h3>
						<h2>7:31:57</h2>
					</div>
					<div class="stat">
						<h3>Longest duration (hrs)</h3>
						<h2>10:53:38</h2>
					</div>
					<div class="stat">
						<h3>Shortest duration (hrs)</h3>
						<h2>3:04:37</h2>
					</div>
					<div class="stat">
						<h3>Earliest bedtime</h3>
						<h2>22:46:23</h2>
					</div>
					<div class="stat">
						<h3>Latest bedtime</h3>
						<h2>05:40:59</h2>
					</div>
					<div class="stat">
						<h3>Earliest wake-up</h3>
						<h2>05:50:16</h2>
					</div>
					<div class="stat">
						<h3>Latest wake-up</h3>
						<h2>14:00:21</h2>
					</div>
					<div class="stat">
						<h3>Total nights recorded</h3>
						<h2>326</h2>
					</div>
				</div>

				<div class="divider"></div>

				<div class="stats-container">
					<header>
						<h2>Weight</h2>
					</header>

					<div class="stat">
						<h3>Average Weight (lbs)</h3>
						<h2>159.99</h2>
					</div>
					<div class="stat">
						<h3>Greatest weight (lbs)</h3>
						<h2>168.70</h2>
					</div>
					<div class="stat">
						<h3>Lowest weight (lbs)</h3>
						<h2>150.80</h2>
					</div>
					<div class="stat">
						<h3>Weigh-ins recorded</h3>
						<h2>74</h2>
					</div>
					<!--<div class="stat">
						<h3>Greatest rate of change (lbs/hr)</h3>
						<h2>0.59</h2>
					</div>-->
				</div>
			</main>
		</section>
	`
});

export default HealthStatsPageView;
