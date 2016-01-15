"use strict";

const View = require("ampersand-view");


module.exports = View.extend({
	template: `
		<section id="start" class="overlay">
			<main>
				<header>
					<h1>Daniel's Twenty Fifteen</h1>
					<h2>An annual report</h2>
				</header>
				
				<p>Blah blah blah blah</p>
				
				<div class="choices">
					<a href="/maps">
						<h3>Maps</h3>
						<p>A few of the cities I've visited</p>
					</a>
					<a href="/stats">
						<h3>Stats</h3>
						<p>A by-the-numbers breakdown</p>
					</a>
				</div>
			</main>
		</section>
	`,
	events: {
		"click .choices a": "clickChoice"
	},
	render: function() {
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
	},
	clickChoice: function(event) {
		
		this.el.parentNode.removeChild(this.el);
		this.remove();
		
	}
});
