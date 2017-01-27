"use strict";

const View = require("ampersand-view");
const d3 = require("d3");
d3.tip = require("d3-tip");

const MapView = require("./map");
const MapAreaModel = require("../models/map-area");

const areas = require("../data/areas_cycling");
const rides = require("../data/2016_rides.json");

const weeklyRideData = [50302.50000000001,33559.5,23099,50388.00000000001,73886,24898.5,58426.99999999999,18232.3,0,138869.69999999998,59372.8,81800.50000000001,36854.100000000006,28328.5,82869.6,79874.89999999998,174719.29999999996,49683.4,91547.5,132622.30000000002,145844.3,24098,131533.6,44963.4,206832.70000000004,130593.99999999999,144519.90000000002,0,45542.7,101783,169681.9,91808.49999999999,159448.1,138288.7,83222.1,156814.4,63459.299999999996,131488.7,58651.100000000006,56126.299999999996,20427.699999999997,76170.00000000001,113194.20000000003,108305.1,41366.30000000001,63098.49999999999,78047.90000000001,55881.200000000004,54006.79999999999,60308.7,20276.899999999998,12493.6,9922.2]

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
						<h3>Weekly Distances (km)</h3>
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
					<div class="map-container">
						<canvas class="map"></canvas>
					</div>
					<div class="divider"></div>
				</div>
			</main>
		</section>
	`,
	render() {
		this.renderWithTemplate();

		requestAnimationFrame(() => this.buildChart(weeklyRideData));

		return this;
	},
	buildChart(data) {
		const parentEl = this.query(".graph-holder");
		const parent = d3.select(parentEl);
		const margin = {top: 30, right: 30, bottom: 0, left: 30};
		const spaceBetween = 3;

		const height = 172 - margin.top - margin.bottom;
		let width = parentEl.clientWidth - margin.left - margin.right;
		let barWidth = width / data.length;
		let barWidthWithSpace = Math.min(barWidth - spaceBetween, 9);

		const y = d3.scaleLinear().range([height, 0]);

		y.domain([0, d3.max(data, (d) => d)]);

		const svg = parent.select("svg");
		const svgG = svg.append("g");

		const bar = svgG.selectAll(".bar")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "bar");

		const barText = svgG.selectAll(".text-bar")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "text-bar");

		const tip = barText
		.append("g")
		.attr("class", "tip");

		const text = tip
		.append("text")
		.text((d) => (d / 1000).toFixed(2));

		const visibleBar = bar.append("rect");
		const hoverBar = barText.append("rect");

		const resize = () => {
			width = parentEl.clientWidth - margin.left - margin.right;
			barWidth = width / data.length;
			barWidthWithSpace = Math.min(barWidth - spaceBetween, 9);
			const xOffset = (barWidth - barWidthWithSpace) / 2;

			svg
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

			svgG.attr("transform", `translate(${margin.left}, ${margin.top})`);

			bar.attr("transform", (d, i) => `translate(${i * barWidth}, 0)`);
			barText.attr("transform", (d, i) => `translate(${i * barWidth}, 0)`)

			const visibleBarY = (d) => {
				const v = y(d);
				const h = height - v;

				if (h < barWidthWithSpace) {
					return height - barWidthWithSpace;
				}

				return v;
			};

			const visibleBarHeight = (d) => {
				const h = height - y(d);

				if (d === 0) {
					return h
				}

				return Math.max(h, barWidthWithSpace)
			};

			visibleBar
			.attr("y", height)
			.attr("x", xOffset)
			.attr("width", barWidthWithSpace)
			//.attr("height", barWidthWithSpace)
			.attr("rx", (barWidthWithSpace / 2))
			.attr("ry", (barWidthWithSpace / 2))

			visibleBar
			.transition()
			.ease(d3.easeQuadInOut)
		    .duration(400)
		    .delay((d, i) => i * 8)
			.attr("y", visibleBarY)
			.attr("height", visibleBarHeight);

			tip.attr("transform", `translate(${xOffset}, -${margin.top / 2})`);

			hoverBar
			.attr("height", height)
			.attr("width", barWidth)

			text.attr("y", visibleBarY)
		};

		resize();
		d3.select(window).on("resize", resize);

		/*bar.append("text")
		.attr("x", barWidth / 2)
		.attr("y", (d) => y(d) + 3)
		.attr("dy", ".75em")
		.text((d) => (d / 1000).toFixed(2));*/
	},
	/*subviews: {
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
	}*/
});
