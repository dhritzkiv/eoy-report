import StatView from "./stat";
import * as d3 from "d3";
import throttle from "lodash/throttle";

const BarStatView = StatView.extend({
	/**
	 * @param {Element} el
	 * @param {{label: string, value: number}[]} data
	 */
	buildChart(el, data) {
		const parent = d3.select(el);
		const svg = parent.select("svg");
		const svgG = svg.append("g");

		const margin = {top: 20, right: 0, bottom: 20, left: 0};
		let height = 0;
		let width = 0;
		let barWidth = 0;
		let spaceBetween = 0;
		let barWidthWithSpace = 0;
		let xOffset = 0;
		let currentIndex = d3.scan(data, (a, b) => b.value - a.value);

		const y = d3.scaleLinear();

		y.domain([0, d3.max(data, ({value: d}) => d)]);

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

		const bar = svgG.selectAll(".bar")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "bar");

		const valueBarText = svgG
		.append("g")
		.attr("class", "text-bar");

		const valueText = valueBarText.append("text");

		const labelBarText = svgG
		.append("g")
		.attr("class", "text-bar");

		const labelText = labelBarText.append("text");

		const hoverBar = bar.append("rect").attr("class", "hover-bar");
		const visibleBar = bar.append("rect");

		const showText = ({value, label}, i) => {
			currentIndex = i;
			const transitionDuration = 150;
			const easingFunction = d3.easeSinOut;

			const valueTranslateX = (i * barWidth) + (xOffset + (barWidthWithSpace / 2));
			const valueTranslateY = visibleBarY(value) - (margin.top / 2);

			valueBarText
			.transition()
			.ease(easingFunction)
			.duration(transitionDuration)
			.attr("transform", `translate(${valueTranslateX}, ${valueTranslateY})`);

			valueText.text(parseFloat(value.toFixed(2)));

			const labelTranslateX = valueTranslateX;
			const labelTranslateY = height + (margin.top / 2);

			labelBarText
			.transition()
			.ease(easingFunction)
			.duration(transitionDuration)
			.attr("transform", `translate(${labelTranslateX}, ${labelTranslateY})`);

			labelText.text(label);
		};

		bar.on("mouseover touchstart", showText);

		const resize = throttle(() => requestAnimationFrame(() => {
			svg
			.attr("width", 0)
			.attr("height", 0);

			width = el.parentElement.clientWidth - margin.left - margin.right;
			height = el.parentElement.clientHeight - margin.top - margin.bottom;
			barWidth = Math.max(width / data.length, 0.1);
			spaceBetween = Math.max(barWidth / 2, 0);
			barWidthWithSpace = Math.min(barWidth - spaceBetween, 10);
			xOffset = (barWidth - barWidthWithSpace) / 2;

			y.range([height, 0]);

			const borderRadius = Math.max((barWidthWithSpace / 2), 0);
			const barPosition = (i) => `translate(${i * barWidth}, 0)`;

			svg
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

			svgG
			.attr("transform", `translate(${margin.left}, ${margin.top})`);

			hoverBar
			.attr("height", height)
			.attr("width", barWidth);

			bar.attr("transform", (d, i) => barPosition(i));
			valueBarText.attr("transform", (d, i) => barPosition(i));

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
			.attr("y", ({value: d}) => visibleBarY(d))
			.attr("height", ({value: d}) => visibleBarHeight(d));

			showText(data[currentIndex], currentIndex);
		}), 1000);

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

export default BarStatView;
