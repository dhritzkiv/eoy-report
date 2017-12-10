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

		const height = 420 - margin.top - margin.bottom;
		const width = 640 - margin.left - margin.right;

		const x = d3.scaleLinear().range([0, width]);
		const y = d3.scaleLinear().range([height, 0]);

		x.domain([0, data.length - 1]);
		y.domain(d3.extent(data, d => d));

		const sline = d3.line()
		.x((d, i) => x(i))
		.y(d => y(d));

		const svg = parent.select("svg");
		const svgG = svg.append("g");

		svg
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

		svgG.attr("transform", `translate(${margin.left}, ${margin.top})`);

		svgG.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 5)
		.attr("d", sline);
	}
});

export default StatView;
