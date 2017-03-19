"use strict";

const View = require("ampersand-view");
const State = require("ampersand-state");
const Collection = require("ampersand-collection");
const ViewSwitcher = require("ampersand-view-switcher");

const MapView = require("./map");

const AreaListItemState = State.extend({
	props: {
		name: {
			type: "string"
		},
		title: {
			type: "string"
		}
	}
});

const AreaListCollection = Collection.extend({
	model: AreaListItemState
});

const AreaListItemView = View.extend({
	template: `<li><a></a></li>`,
	bindings: {
		"model.name": {
			selector: "a",
			type: "attribute",
			name: "data-area"
		},
		"model.title": {
			selector: "a"
		}
	}
});

module.exports = View.extend({
	props: {
		area: {
			type: "string",
			default: ""
		},
		areas: {
			type: "object",
			default: () => ({})
		},
		rides: {
			type: "array",
			default: () => []
		}
	},
	template: (
		`<div data-hook="map-picker">
			<div class="areas">
				<h3>Pick an area:</h3>
				<ul></ul>
			</div>
			<div class="map-container">
				<a href="#" data-hook="clear-area">Back to locations</a>
				<div data-hook="map-switcher"></div>
			</div>
		</div>`
	),
	events: {
		"click [data-hook=clear-area]": "clearArea",
		"click .areas li a": "areaClick"
	},
	bindings: {
		area: [
			{
				type: "toggle",
				hook: "clear-area"
			},
			{
				type: "toggle",
				invert: true,
				selector: ".areas"
			}
		]
	},
	render() {
		this.renderWithTemplate(this);

		const switcher = new ViewSwitcher(this.queryByHook("map-switcher"));

		this.on("change:area", () => {

			if (this.area === "") {
				switcher.clear();

				return;
			}

			const area = this.areas[this.area];
			const data = this.rides;

			const view = new MapView({
				area,
				data//make an array of layers
			});

			switcher.set(view);
		});

		const areasCollection = new AreaListCollection();

		Object.entries(this.areas)
		.map(([key, value]) => ({
			name: key,
			title: value.name
		}))
		.forEach(area => areasCollection.add(area));

		this.renderCollection(areasCollection, AreaListItemView, this.query(".areas ul"));

		return this;
	},
	areaClick(event) {
		event.preventDefault();

		const area = event.delegateTarget.getAttribute("data-area");

		this.area = area;
	},
	clearArea(event) {
		event.preventDefault();

		this.area = "";
	}
});
