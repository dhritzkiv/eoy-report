import StatView from "./stat";
import * as d3 from "d3";
import app from "ampersand-app";

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
		const minimumSpaceBetweenValues = 10;

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

		const barTextHolder = svgG
		.selectAll(".text-holder")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "text-holder");

		const barTextTitle = barTextHolder
		.append("text")
		.attr("class", "bar-text title")
		.text(d => d[0]);

		const barTextValue = barTextHolder
		.append("text")
		.attr("class", "bar-text value")
		.text(d => d[1]);

		barTextHolder
		.selectAll("text")
		.attr("font-size", "14px");

		//const hoverBar = bar.append("rect").attr("class", "hover-bar");
		const visibleBar = bar.append("rect");

		/*hoverBar
		.attr("height", barHeight);*/

		const resize = () => requestAnimationFrame(() => {
			const contentHeight = (data.length * barHeightWithSpace);

			width = el.clientWidth - margin.left - margin.right;
			height = Math.max(contentHeight, el.parentElement.clientHeight) - margin.top - margin.bottom;

			if (!width || !height) {
				return;
			}

			//update range
			x.range([0, width]);

			/*hoverBar
			.attr("width", width);*/

			const borderRadius = Math.max((barHeight / 2), 0);
			const barPosition = (i) => `translate(0, ${i * barHeightWithSpace})`;

			svg
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

			svgG.attr("transform", `translate(${margin.left}, ${margin.top})`);

			bar.attr("transform", (d, i) => barPosition(i));

			barTextHolder.attr("transform", (d, i) => barPosition(i));

			barTextTitle
			.text(d => d[0])
			.text(function(d) {
				const originalTitle = d[0];
				let currentTitle = originalTitle;
				const valueLength = d[1].toString().length;
				const currentValueWidth = this.getSubStringLength(0, valueLength);

				while (currentTitle.length) {
					const currentWidth = this.getSubStringLength(0, currentTitle.length);
					const elipsisWidth = currentTitle === originalTitle ? 0 : this.getSubStringLength(0, 3);

					if ((currentWidth + minimumSpaceBetweenValues) < (width - currentValueWidth - elipsisWidth)) {
						break;
					}

					const futureTitle = `${originalTitle.substring(0, currentTitle.length - 2)}…`;

					currentTitle = futureTitle;
				}

				return currentTitle;
			});

			barTextValue
			.attr("dx", function(d) {
				const title = d3.select(this.parentNode).select(".bar-text.title");
				const valueTextWidth = this.getComputedTextLength();

				const barWidth = visibleBarX(d);
				const titleTextWidth = title.node().getComputedTextLength();

				const dx = Math.min(width, Math.max(barWidth, titleTextWidth + valueTextWidth + minimumSpaceBetweenValues));

				return dx;
			});

			visibleBar
			.attr("rx", borderRadius)
			.attr("ry", borderRadius)
			.attr("width", visibleBarX);

			visibleBar
			.attr("y", barHeight)
			.attr("height", barHeight);

			//check if a scrollbar likely appeared, causing the container to shrink
			if (width > (el.clientWidth - margin.left - margin.right)) {
				resize();
			}
		});

		resize();

		app.onFontLoad(resize, this);

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
