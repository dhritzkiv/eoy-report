import StatView from "./stat";
import * as d3 from "d3";

const PI = Math.PI;
const TAU = 2 * PI;
const SCALE = 100000;

/**
 * @typedef Layer
 * @property {GeoJSON} geojson
 */

/**
 * @typedef MapData
 * @property {Layer[]} layers
 * @property {[number, number]} center
 * @property {number} [minZoom]
 * @property {number} [maxZoom]
 * @property {number} [startScale]
 */

const LineStatView = StatView.extend({
	/**
	 * @param {Element} el
	 * @param {MapData} data
	 */
	buildChart(el, data) {
		const {minZoom = 19, maxZoom = 23, startZoom = (minZoom + maxZoom) / 2, center, layers} = data;
		const parent = d3.select(el);
		const svg = parent.select("svg");
		const margin = {top: 10, right: 10, bottom: 10, left: 10};

		let height = 0;
		let width = 0;

		// Initialize the projection to fit the world in a 1×1 square centered at the origin.
		const projection = d3.geoMercator()
		.scale(SCALE / TAU)
		.translate([0, 0]);

		const path = d3.geoPath()
		.projection(projection);

		const layersEls = [];

		const zoomed = () => {
			const {transform} = d3.event;

			layersEls.forEach((layersG) => {
				layersG
				.selectAll("path")
				.attr("transform", transform)
				.style("stroke-width", 2.5 / transform.k);

				layersG
				.selectAll("text")
				.attr("transform", transform)
				.style("font-size", d => (24 * d.properties.size) / transform.k);

				layersG
				.selectAll("text.shadow")
				.style("stroke-width", 2 / transform.k);

				const shadowOffset = 2 / transform.k;

				layersG
				.selectAll("text.shadow.plus")
				.attr("dx", shadowOffset)
				.attr("dy", shadowOffset);

				layersG
				.selectAll("text.shadow.minus")
				.attr("dx", -shadowOffset)
				.attr("dy", -shadowOffset);
			});
		};

		const zooms = d3.zoom()
		.filter(() => {
			/**@type {{event: (MouseEvent | MouseWheelEvent | TouchEvent)}} */
			const {event} = d3;

			if (event.type === "wheel") {
				return event.shiftKey;
			}

			return !d3.event.button;
		})
		.scaleExtent([(1 << minZoom) / SCALE, (1 << maxZoom) / SCALE])
		.on("zoom", zoomed);

		// Compute the projected initial center.
		const projectedCenter = projection(center);

		const resize = () => requestAnimationFrame(() => {
			height = el.parentElement.clientHeight - margin.top - margin.bottom;
			width = el.parentElement.clientWidth - margin.left - margin.right;

			const zoomIdent = d3.zoomIdentity
			.translate(width / 2, height / 2)
			.scale((1 << startZoom) / SCALE)
			.translate(...projectedCenter.map(d => -d));

			svg
			.call(zooms)
			.call(
				zooms.transform,
				zoomIdent
			);

			svg
			.attr("width", el.parentElement.clientWidth)
			.attr("height", el.parentElement.clientHeight);
		});

		resize();

		const loadLayers = async () => {
			for (const layer of layers) {
				let {geojson} = layer;
				const layersG = svg.append("g");

				if (!geojson) {
					const res = await fetch(layer.uri);

					if (!res.ok) {
						continue;
					}

					geojson = await res.json();
				} else {
					await new Promise(resolve => requestAnimationFrame(resolve));
				}

				layersG.attr("transform", `translate(${margin.left}, ${margin.top})`);

				if (
					geojson.type === "Feature" &&
					geojson.geometry.type === "Point" &&
					geojson.properties.type === "text"
				) {
					layersG
					.attr("class", "text-holder");

					layersG
					.selectAll("text.shadow.plus")
					.data([geojson])
					.enter()
					.append("text")
					.attr("class", "shadow plus")
					.text(d => d.properties.text)
					.attr("x", d => {
						const [left] = path.centroid(d);

						return left;
					})
					.attr("y", d => {
						const [, top] = path.centroid(d);

						return top;
					});

					layersG
					.selectAll("text.shadow.minus")
					.data([geojson])
					.enter()
					.append("text")
					.attr("class", "shadow minus")
					.text(d => d.properties.text)
					.attr("x", d => {
						const [left] = path.centroid(d);

						return left;
					})
					.attr("y", d => {
						const [, top] = path.centroid(d);

						return top;
					});

					layersG
					.selectAll("text:not(.shadow)")
					.data([geojson])
					.enter()
					.append("text")
					.text(d => d.properties.text)
					.attr("x", d => {
						const [left] = path.centroid(d);

						return left;
					})
					.attr("y", d => {
						const [, top] = path.centroid(d);

						return top;
					});
				} else {
					layersG.selectAll("path")
					.data(geojson.features)
					.enter()
					.append("path")
					.attr("d", path);
				}

				layersG
				.selectAll("*")
				.attr("class", function(d) {
					const classes = ["feature"];
					const currentClass = d3.select(this).attr("class");

					if (currentClass) {
						classes.push(currentClass);
					}

					if (d.properties && d.properties.type) {
						classes.push(d.properties.type);
					}

					classes.push(d.geometry.type.toLowerCase());

					return classes.join(" ");
				});

				layersEls.push(layersG);

				resize();
			}
		};

		loadLayers();

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
