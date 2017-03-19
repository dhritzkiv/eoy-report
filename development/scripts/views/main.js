"use strict";

const fs = require("fs");
const shuffle = require("lodash/shuffle");
const scroll = require("scroll");
const ease = require("ease-component");

const View = require("ampersand-view");
const ViewSwitcher = require("ampersand-view-switcher");

const svg_coffee = fs.readFileSync(`${__dirname}/../../img/category-icon_coffee.svg`, "utf8");
const svg_beer = fs.readFileSync(`${__dirname}/../../img/category-icon_beer.svg`, "utf8");
const svg_cycling = fs.readFileSync(`${__dirname}/../../img/category-icon_cycling.svg`, "utf8");
const svg_health = fs.readFileSync(`${__dirname}/../../img/category-icon_health.svg`, "utf8");

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
				<article class="category-icon health">
					<a href="/health">
						${svg_health}
					</a>
				</article>
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
			show: (newView) => {
				window.scrollTo(0, 0);

				if (!newView) {
					return;
				}

				scroll.top(document.scrollingElement, pageContainer.offsetTop, {
					duration: 500,
					ease: ease.inOutQuart
				});
			}
		});

		const categoryIconsExtrasHolders = this.queryAll(".category-icon svg .extras");

		categoryIconsExtrasHolders.forEach(holder => {
			const children = shuffle(Array.from(holder.children));

			children.forEach((extra, index) => {
				const delay = 50 + (index * 25);

				extra.style.transitionDelay = `${delay}ms`;
			})
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
