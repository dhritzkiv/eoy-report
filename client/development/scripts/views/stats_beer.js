import StatsView from "./stats";
import xhr from "xhr";

const BeerStatsPageView = StatsView.extend({
	template: `
		<section class="stats-section category beer">
			<main data-hook="stats-holder">

			</main>
		</section>
	`//,
	/*render() {
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
	}*/
});

export default BeerStatsPageView;
