"use strict";

const View = require("ampersand-view");
const app = require("ampersand-app");

module.exports = View.extend({
	template: `
		<section id="start" class="overlay">
			<main>
				<header>
					<h1>Daniel's Twenty Fifteen</h1>
					<h2>An annual report</h2>
				</header>
				
				<div class="body">
					<p>Lightly inspired by Nicholas Felton's decade-long <a target="_blank" href="http://feltron.com">Annual Report series,</a> <em>Daniel's Twenty Fifteen</em> is an excercise in personal data collection and reflection. Metrics collected include location, movement, and consumption.</p>
					
					<p>A trend I noticed in <span class="digit">2015</span> was myself making as many opportunities as possible to move around using only human power. As such, only walking and cycling are included on the maps in this report.</p>
				
					<p>My goals for <span class="digit">2016</span> are to travel and move more &ndash;within Southern Ontario and abroad&ndash; while being extra meticulous in my data gathering.</p>
				</div>
				
				<div class="choices">
					<a href="/maps">
						<h3>Maps</h3>
						<p>A few of the cities visited &#x25B8;</p>
					</a>
					<a href="/stats">
						<h3>Stats</h3>
						<p>A by-the-numbers breakdown &#x25B8;</p>
					</a>
				</div>
			</main>
		</section>
	`,
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
		
		this.once("change:rendered", function() {
			setTimeout(() => {
				this.listenToOnce(app.router, "route", this.close);
			}, 0);
		});
		
		return this;
	},
	close: function() {		
		this.el.classList.add("hiding");
		
		setTimeout(() => {
			this.el.parentNode.removeChild(this.el);
			this.remove();
		}, 900);
		
	}
});
