"use strict";

const fs = require("fs");

const View = require("ampersand-view");
const ViewSwitcher = require("ampersand-view-switcher");

const svg_coffee = fs.readFileSync(`${__dirname}/../../img/category-icon_coffee.svg`, "utf8");
const svg_beer = fs.readFileSync(`${__dirname}/../../img/category-icon_beer.svg`, "utf8");
const svg_cycling = fs.readFileSync(`${__dirname}/../../img/category-icon_cycling.svg`, "utf8");

const MainView = View.extend({
	template: (
	`<body>
		<header>
			<div class="about">
				<h1>Twenty Six-teen</h1>
			</div>

			<div class="categories-list">
				<article class="category-icon coffee">
					<a href="/coffee">
						${svg_coffee}
					</a>
				</article>
				<article class="category-icon cycling">
					<a href="/cycling">
						${svg_cycling}
					</a>
				</article>
				<article class="category-icon beer">
					<a href="/beer">
						${svg_beer}
					</a>
				</article>
				<article class="category-icon walking"></article>
				<article class="category-icon health"></article>
				<article class="category-icon coding"></article>
			</div>
		</header>
		<main class="page-container"></main>
	</body>`
	),
	events: {
		"click a[href]": "linkClick"
	},
	/*setMode: function(view) {
		this.pageContainer.innerHTML = "";

		this.modeSwitcher.set(view);
	},*/
	render: function() {
		this.renderWithTemplate();

		const pageContainer = this.pageContainer = this.query(".page-container");

		this.pageSwitcher = new ViewSwitcher(pageContainer, {
			show: () => {
				window.scrollTo(0, 0);
			}
		});

		return this;
	},
	linkClick: function(event) {
		const {delegateTarget: {host, pathname, search}} = event;

		if (host !== window.location.host) {
			return true;
		}

		app.router.navigate(`${pathname}${search}`);
		event.preventDefault();
	}
});

module.exports = MainView;