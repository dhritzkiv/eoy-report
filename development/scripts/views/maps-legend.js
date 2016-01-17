"use strict";

const app = require("ampersand-app");
const View = require("ampersand-view");

module.exports = View.extend({
	props: {
		area_name: {
			type: "string"
		}
	},
	template: `<section id="maps-legend" class="overlay">
		<a href="#" data-hook="close">Close</a>
		<main>
			<div class="text-holder">
				<div class="text">
					<h2></h2>
					<p data-hook="body"></p>
					<p class="sources">Data sources: <span></span></p>
				</div>
			</div>
			<div class="legend-holder">
				<div class="legend">
					<h3>Legend</h3>
					<div class="features">
						<article data-feature="cycling"><div class="icon"></div>Cycling</article>
						<article data-feature="walking"><div class="icon"></div>Walking</article>
						<article data-feature="checkins"><div class="icon"></div>Checkin</article>
						<hr/>
						<article data-feature="water"><div class="icon"></div>Water</article>
						<article data-feature="parks"><div class="icon"></div>Park</article>
						<article data-feature="airport"><div class="icon"></div>Airport</article>
						<article data-feature="transit"><div class="icon"></div>Transit Line</article>
						<article data-feature="buildings"><div class="icon"></div>Building</article>
					</div>
				</div>
			</div>
		</main>
	</section>`,
	derived: {
		sourcesHTML: {
			deps: ["model.sources"],
			fn: function() {
				return this.model.sources.map(source => {
					if (Array.isArray(source)) {
						return `<a href="${source[1]}">${source[0]}</a>`;
					}
					
					return source;
				}).join(", ");
			}
		}
	},
	bindings: {
		"model.name": {
			type: "text",
			selector: "h2"
		},
		"model.text": {
			type: "innerHTML",
			hook: "body"
		},
		"model.sources.length": {
			type: "toggle",
			selector: "p.sources"
		},
		"sourcesHTML": {
			type: "innerHTML",
			selector: "p.sources span"
		}
	},
	events: {
		"click [data-hook=close]": "closeHandler"
	},
	/*render: function() {
		this.renderWithTemplate(this);
		
		const choiceEls = this.queryAll(".choices a");
		const defaultClassName = "default";
		
		choiceEls.forEach(el => el.classList.add(defaultClassName));
		
		setTimeout(() => {
			requestAnimationFrame(() => choiceEls.forEach(
				el => el.classList.remove(defaultClassName)
			));
		}, 400);
		
		return this;
	},*/
	initialize: function() {
		this.model = this.parent.area;
		
		this.listenTo(this.parent, "remove", this.close);
		this.listenTo(this.parent, "change:area_name", this.close);
	},
	closeHandler: function(event) {
		this.close();
		
		app.router.navigate(`/maps/${this.area_name}`, {
			replace: false,
			trigger: false
		});
		
		event.preventDefault();
		event.stopImmediatePropagation();
	},
	close: function() {
		this.el.parentNode.removeChild(this.el);
		this.remove();
	}
});
