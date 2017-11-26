import StatsView from "./stats";
//import xhr from "xhr";

const CoffeePageView = StatsView.extend({
	template: `
		<section class="category coffee">
			<header>
				<div class="art"></div>
				<div class="copy">
					<p></p>
				</div>
			</header>
			<main class="stats">
				<div class="stats-container">
					<div class="stat">
						<h3>Average Daily Coffees</h3>
						<h2>0.94</h2>
					</div>
					<div class="stat">
						<h3>Est. Total Volume (L)</h3>
						<h2>122.62</h2>
					</div>
					<div class="stat">
						<h3>Median Daily Coffees</h3>
						<h2>1</h2>
					</div>
					<div class="stat">
						<h3>Average Weekday Coffees</h3>
						<h2>0.98</h2>
					</div>
					<div class="stat">
						<h3>Average Weekend Coffees</h3>
						<h2>0.87</h2>
					</div>
					<div class="stat">
						<h3>Est. Days Without</h3>
						<h2>73</h2>
					</div>
					<div class="stat">
						<h3>Est. Days with More than Median</h3>
						<h2>51</h2>
					</div>
					<div class="stat">
						<h3>Most Daily Coffees</h3>
						<h2>3</h2>
					</div>
					<div class="stat">
						<h3>Longest streak (coffees)</h3>
						<h2>15</h2>
					</div>
					<div class="stat">
						<h3>Longest dry spell (days)</h3>
						<h2>3</h2>
					</div>
					<div class="stat">
						<h3>Total Days Recorded</h3>
						<h2>286</h2>
					</div>
				</div>
			</main>
		</section>
	`
});

export default CoffeePageView;
