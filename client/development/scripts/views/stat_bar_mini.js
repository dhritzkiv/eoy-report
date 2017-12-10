import View from "ampersand-view";
import * as d3 from "d3";

const StatView = View.extend({
	template: `
		<article class="stat">
			<header>
				<h2 data-hook="title"></h2>
			</header>
			<main>
				<div data-hook="viz-holder">
					<svg></svg>
				</div>
			</main>
		</article>
	`,
	bindings: {
		"model.title": {
			hook: "title"
		}
	},
	render() {
		this.renderWithTemplate(this);

		const vizEl = this.queryByHook("viz-holder");

		this.buildChart(vizEl, this.model.data.value);

		return this;
	},
	/**
	 * @param {Element} el
	 * @param {number[]} data
	 */
	buildChart(el, data) {
		const parent = d3.select(el);
		const margin = {top: 20, right: 20, bottom: 20, left: 20};

		const height = 480 - margin.top - margin.bottom;
		const width = 640 - margin.left - margin.right;
		const barWidth = Math.max(width / data.length, 0.1);
		const spaceBetween = Math.max(barWidth / 2, 1);
		const barWidthWithSpace = barWidth - spaceBetween;
		const xOffset = (barWidth - barWidthWithSpace) / 2;

		const y = d3.scaleLinear().range([height, 0]);

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
				return h;
			}

			return Math.max(h, barWidthWithSpace);
		};

		y.domain([0, d3.max(data, (d) => d)]);

		const svg = parent.select("svg");
		const svgG = svg.append("g");

		const bar = svgG.selectAll(".bar")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "bar");

		const barText = svgG
		.append("g")
		.attr("class", "text-bar");

		const tip = barText
		.append("g")
		.attr("class", "tip");

		const text = tip.append("text");

		const hoverBar = bar.append("rect").attr("class", "hover-bar");
		const visibleBar = bar.append("rect");

		hoverBar
		.attr("height", height)
		.attr("width", barWidth);

		bar
		.on("mouseover touchstart", (d, i) => {
			const transitionDuration = 150;
			const easingFunction = d3.easeSinOut;

			barText
			.transition()
			.ease(easingFunction)
			.duration(transitionDuration)
			.attr("transform", () => `translate(${i * barWidth}, 0)`);

			const translateY = -(margin.top / 2) + visibleBarY(d);

			tip
			.transition()
			.ease(easingFunction)
			.duration(transitionDuration)
			.attr("transform", `translate(${xOffset}, ${translateY})`);

			text.text(parseFloat(d.toFixed(2)));
		});

		const resize = () => {
			const borderRadius = Math.max((barWidthWithSpace / 2), 0);
			const barPosition = (i) => `translate(${i * barWidth}, 0)`;

			svg
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

			svgG.attr("transform", `translate(${margin.left}, ${margin.top})`);

			bar.attr("transform", (d, i) => barPosition(i));
			barText.attr("transform", (d, i) => barPosition(i));

			visibleBar
			.attr("y", height)
			.attr("x", xOffset)
			.attr("width", barWidthWithSpace)
			.attr("rx", borderRadius)
			.attr("ry", borderRadius);

			visibleBar
			.transition()
			.ease(d3.easeQuadInOut)
			.duration(400)
			.delay((d, i) => i * 8)
			.attr("y", visibleBarY)
			.attr("height", visibleBarHeight);
		};

		resize();

		d3.select(window).on("resize", () => {
			const newWidth = el.clientWidth - margin.left - margin.right;

			if (Math.floor(width) !== Math.floor(newWidth)) {
				resize();
			}
		});

		this.once("remove", () => d3.select(window).on("resize", null));
	}
});

export default StatView;
