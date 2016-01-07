"use strict";

const View = require("ampersand-view");
const State = require("ampersand-state");
const ViewSwitcher = require('ampersand-view-switcher');

const StatsCollection = require("../models/stats");
const StatView = require("./stat");

const modelDatas = {
	cycling: require(`../types-data/cycling.json`),
	walking: require(`../types-data/walking.json`),
	"food+liquor": require(`../types-data/food+liquor.json`),
	"audio+video": require(`../types-data/audio+video.json`),
	"miscellaneous": require(`../types-data/miscellaneous.json`)
};

//["cycling"].forEach(type => modelDatas[type] = require(`${__dirname}/types-data/${type}.json`));

const TypeModel = State.extend({
	props: {
		title: {
			type: "string"
		},
		text: {
			type: "string"
		},
		sources: {
			type: "array",
			default: () => []
		}
	},
	collections: {
		stats: StatsCollection
	}
});

const TypeView = View.extend({
	template: `
		<section>
			<div class="text-holder">
				<div class="text">
					<h2></h2>
					<p data-hook="body"></p>
					<p class="sources">Sources: <span></span></p>
				</div>
			</div>
			<div class="stats"></div>
		</section>
	`,
	derived: {
		sourcesHTML: {
			deps: ["model.sources"],
			fn: function() {
				return this.model.sources.join(", ");
			}
		},
		text_formatted: {
			deps: ["model.text"],
			fn: function() {
				return this.model.text
				.replace(/(\s|^)(\d(?:\d|\.|,|\+|\s)+(?:k?m)?)([\s\.,])/gi, `$1<span class="digit">$2</span>$3`)
				.replace(/(\d(?:\d|\.|,|\+|\s)+)(m|km|s|min|hr)(\s|\.|<|$)/gi, `$1<abbr class="si-unit">$2</abbr>$3`);
			}
		}
	},
	bindings: {
		"text_formatted": {
			type: "innerHTML",
			hook: "body"
		},
		"model.sources.length": {
			type: "toggle",
			selector: ".sources"
		},
		sourcesHTML: {
			type: "innerHTML",
			selector: ".sources span"
		},
		"model.title": {
			selector: "h2"
		}
	},
	render: function() {
		this.renderWithTemplate(this);
		
		this.renderCollection(this.model.stats, StatView, this.query(".stats"));
		
		return this;
	}
})

module.exports = View.extend({
	props: {
		type: {
			type: "string",
			default: "cycling"
		},
		title: {
			type: "string"
		}
	},
	template: `
		<section id="stats">
			<main></main>
			<nav>
				<a href="/stats/cycling">Cycling</a>
				<a href="/stats/walking">Walking</a>
				<a href="/stats/food+liquor">Food & Liquor</a>
				<a href="/stats/audio+video">Audio & Video</a>
				<a href="/stats/miscellaneous">Miscellaneous</a>
			</nav>
		</section>
	`,
	bindings: {
		type: {
			type: "attribute",
			name: "data-type",
			selector: "main"
		},
		title: {
			type: "attribute",
			name: "data-title",
			selector: "main"
		},
	},
	render: function() {
		this.renderWithTemplate(this);
		
		this.pageContainer = this.query('main');
		this.pageSwitcher = new ViewSwitcher(this.pageContainer);
		
		this.listenToAndRun(this, "change:type", () => {
			
			let model = new TypeModel(modelDatas[this.type]);
			
			const view = new TypeView({
				model: model
			});
			
			this.title = model.title;
			
			this.pageSwitcher.set(view);
		});
		
		return this;
	}
});