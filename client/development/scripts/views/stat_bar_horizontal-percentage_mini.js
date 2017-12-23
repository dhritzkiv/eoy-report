import StatView from "./stat";
import * as d3 from "d3";

const HorizonatlBarStatView = StatView.extend({
	/**
	 * @param {Element} el
	 * @param {[string, number]} data
	 */
	buildChart(el, data) {
		const parent = d3.select(el);
		const svg = parent.select("svg");
		const svgG = svg.append("g");

		const margin = {top: 10, right: 0, bottom: 10, left: 0};
		const barHeight = 10;
		const spaceBetween = 4;
		const barHeightWithSpace = (barHeight * 4) + spaceBetween;

		let width = 0;
		let height = 0;

		const x = d3.scaleLinear();

		x.domain([0, d3.max(data, ([, d]) => d)]);

		const visibleBarX = ([, d]) => {
			const h = x(d);

			if (h < barHeight) {
				return barHeight;
			}

			return h;
		};

		const bar = svgG.selectAll(".bar")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "bar");

		const barText = svgG.selectAll(".text")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "bar-text")
		.append("text");

		const hoverBar = bar.append("rect").attr("class", "hover-bar");
		const visibleBar = bar.append("rect");

		hoverBar
		.attr("height", barHeight);

		const resize = () => requestAnimationFrame(() => {
			width = el.parentElement.clientWidth - margin.left - margin.right;
			height = Math.min((data.length * barHeightWithSpace), el.parentElement.clientHeight) - margin.top - margin.bottom;

			//update range
			x.range([0, width]);

			hoverBar
			.attr("width", width);

			const borderRadius = Math.max((barHeight / 2), 0);
			const barPosition = (i) => `translate(0, ${i * barHeightWithSpace})`;

			svg
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

			svgG.attr("transform", `translate(${margin.left}, ${margin.top})`);

			bar.attr("transform", (d, i) => barPosition(i));
			barText.attr("transform", (d, i) => barPosition(i));

			barText
			.attr("font-size", "14px")
			.text(([text, val]) => `${text} (${val})`);

			visibleBar
			/*.attr("y", height)
			.attr("x", xOffset)*/
			.attr("width", visibleBarX)
			.attr("rx", borderRadius)
			.attr("ry", borderRadius);

			visibleBar
			/*.transition()
			.ease(d3.easeQuadInOut)
			.duration(400)
			.delay((d, i) => i * 8)*/
			.attr("y", barHeight)
			.attr("height", barHeight);
		});

		resize();

		const windowResizeListener = () => {
			const newWidth = el.clientWidth - margin.left - margin.right;

			if (Math.floor(width) !== Math.floor(newWidth)) {
				resize();
			}
		};

		window.addEventListener("resize", windowResizeListener, false);

		this.once("remove", () => window.removeEventListener("resize", windowResizeListener, false));
	}
});

export default HorizonatlBarStatView;
