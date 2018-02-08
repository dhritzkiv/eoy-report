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
 * @property {[[number, number], [number, number]]} extent
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

		const scrollMessageG = svg
		.append("g")
		.attr("class", "scroll-message");

		scrollMessageG
		.append("rect");

		scrollMessageG
		.append("text")
		.text("Hold shift to zoom")
		.attr("x", "50%")
		.attr("y", "50%");

		svg.on("wheel", () => {
			/** @type {{event: MouseWheelEvent}} */
			const {event} = d3;
			const hide = () => scrollMessageG.classed("show", false);

			if (event.shiftKey) {
				hide();

				return true;
			}

			clearTimeout(scrollMessageG.showTimeout);

			scrollMessageG
			.classed("show", true);

			scrollMessageG.showTimeout = setTimeout(hide, 2000);
		});

		scrollMessageG.on("mousedown", () => {
			scrollMessageG.classed("show", false);
		});

		// Initialize the projection to fit the world in a 1×1 square centered at the origin.
		const projection = d3.geoMercator()
		.scale(SCALE / TAU)
		.translate([0, 0]);

		const path = d3.geoPath()
		.projection(projection)
		.pointRadius(0.1);

		const layersEls = [];

		const zoomed = () => {
			const {transform} = d3.event;

			layersEls.forEach((layersG) => {
				layersG
				.selectAll("path")
				.attr("transform", transform)
				.style("stroke-width", 2.5 / transform.k);

				layersG
				.selectAll("path.point:not(text), path.multipoint:not(text)")
				.attr("transform", transform)
				.style("stroke-width", `${0.5 / Math.log10(transform.k)}px`);

				layersG
				.selectAll("text")
				.attr("transform", transform)
				.style("font-size", d => `${(24 * d.properties.size) / transform.k}px`);

				layersG
				.selectAll("text.shadow")
				.style("stroke-width", 6 / transform.k);
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
		});

		if (data.extent) {
			const extentGeoJSON = {
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: data.extent
				}
			};

			const bounds = path.bounds(extentGeoJSON);

			zooms.translateExtent(bounds);
		}

		zooms
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
			.classed("map", true)
			.call(zooms)
			.call(
				zooms.transform,
				zoomIdent
			);

			svg
			.attr("width", el.parentElement.clientWidth)
			.attr("height", el.parentElement.clientHeight);

			scrollMessageG.each(function() {
				this.parentNode.appendChild(this);
			});

			scrollMessageG
			.select("rect")
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
					.selectAll("text.shadow")
					.data([geojson])
					.enter()
					.append("text")
					.attr("class", "shadow")
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
