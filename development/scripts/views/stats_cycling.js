const View = require("ampersand-view");

const MapView = require("./map");
const MapAreaModel = require("../models/map-area");

const areas = require("../data/areas_cycling");
const rides = require("../data/2016_rides.json");

module.exports = View.extend({
	template: `
		<section class="cycling">
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
						<h2>4,094.7</h2>
					</div>

					<div class="stat">
						<h3>Total Rides</h3>
						<h2>830</h2>
					</div>

					<div class="stat">
						<h3>Total Time (hrs)</h3>
						<h2>195:47</h2>
					</div>

					<div class="graph full">

					</div>

					<div class="stat">
						<h3>Total Elevation Gain (m)</h3>
						<h2>9,929.0</h2>
					</div>
				</div>

				<div class="map-holder">
					<div class="divider"></div>
					<div class="map-container">
						<canvas class="map"></canvas>
					</div>
					<div class="divider"></div>
				</div>
			</main>
		</section>
	`,
	subviews: {
		map: {
			selector: ".map",
			prepareView(el) {
				const area = areas.to;

				const view = new MapView({
					el,
					area,
					data: rides//make an array of layers
				});

				return view;

			}
		}
	}
});
