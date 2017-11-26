import StatsView from "./stats";
import xhr from "xhr";

//import areas from "../data/areas_cycling";
//import rides from "../data/2015_rides.json";
import MapPickerView from "./map-picker.js";

const CyclingStatsPageView = StatsView.extend({
	template: `
		<section class="category cycling">
			<header>
				<div class="art"></div>
				<div class="copy">
					<p></p>
				</div>
			</header>
			<main class="stats cycling">
				<div class="stats-container">
					<div class="stat">
						<h3>Total Distance (km)</h3>
						<h2>4,094.70</h2>
					</div>

					<div class="stat">
						<h3>Total Rides</h3>
						<h2>830</h2>
					</div>

					<div class="stat">
						<h3>Total Time (hr)</h3>
						<h2>195:47</h2>
					</div>

					<div class="graph-holder full">
						<div class="divider"></div>
						<h3>Distance Cycled by Week (km)</h3>
						<svg></svg>
						<div class="divider"></div>
					</div>

					<div class="stat">
						<h3>Top Daily Distance (km)</h3>
						<h2 title="On June 26th">153.65</h2>
					</div>

					<div class="stat">
						<h3>Top Weekly Distance (km)</h3>
						<h2>206.83</h2>
					</div>

					<div class="stat">
						<h3>Top Monthly Distance (km)</h3>
						<h2 title="In Auguest">574.44</h2>
					</div>

					<div class="stat">
						<h3>Total Elevation Gain (m)</h3>
						<h2>9,932.00</h2>
					</div>

					<div class="stat">
						<h3>Est. Total Energy (kcal)</h3>
						<h2>80,125.90</h2>
					</div>

					<div class="stat">
						<h3>Est. Peak Speed (km/h)</h3>
						<h2>72.03</h2>
					</div>
				</div>

				<div class="map-holder">
					<div class="divider"></div>
					<div data-hook="map-picker"></div>
					<div class="divider"></div>
				</div>
			</main>
		</section>
	`,
	render() {
		this.renderWithTemplate();

		const graphContainer = this.query(".graph-holder");

		xhr({
			method: "GET",
			uri: "/data/weekly-cycling-data.json",
			json: true
		}, (err, response, data) => {

			if (err) {
				return console.error(err);
			}

			//meters to kms
			data = data.map(d => d / 1000);

			requestAnimationFrame(() => this.buildChart(graphContainer, data));
		});

		return this;
	},
	subviews: {
		map_picker: {
			hook: "map-picker",
			prepareView(el) {

				const view = new MapPickerView({
					el,
					areas,
					rides
				});

				return view;
			}
		}
	}
});

export default CyclingStatsPageView;
