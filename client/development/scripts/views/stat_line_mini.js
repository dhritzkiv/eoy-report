import StatView from "./stat";
import * as d3 from "d3";

const LineStatView = StatView.extend({
	/**
	 * @param {Element} el
	 * @param {number[]} data
	 */
	buildChart(el, data) {
		const parent = d3.select(el);
		const svg = parent.select("svg");
		const svgG = svg.append("g");
		const margin = {top: 10, right: 10, bottom: 10, left: 10};

		let height = 0;
		let width = 0;

		const x = d3.scaleLinear();
		const y = d3.scaleLinear();

		x.domain([0, data.length - 1]);
		y.domain(d3.extent(data, d => d));

		const sline = d3.line()
		.x((d, i) => x(i))
		.y(d => y(d));

		const linePath = svgG.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("class", "line")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 5);

		svgG.attr("transform", `translate(${margin.left}, ${margin.top})`);

		const resize = () => requestAnimationFrame(() => {
			height = el.parentElement.clientHeight - margin.top - margin.bottom;
			width = el.parentElement.clientWidth - margin.left - margin.right;

			x.range([0, width]);
			y.range([height, 0]);

			svg
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

			linePath.attr("d", sline);
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

export default LineStatView;
