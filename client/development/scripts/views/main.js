import app from "ampersand-app";
import shuffle from "lodash/shuffle";
import scroll from "scroll";
import ease from "ease-component";

import View from "ampersand-view";
import ViewSwitcher from "ampersand-view-switcher";

import svg_coffee from "../../img/category-icon_coffee.svg";
import svg_beer from "../../img/category-icon_beer.svg";
import svg_cycling from "../../img/category-icon_cycling.svg";
import svg_health from "../../img/category-icon_health.svg";
import svg_media from "../../img/category-icon_media.svg";
import svg_walking from "../../img/category-icon_walking.svg";

const MainView = View.extend({
	template: (`
	<body>
		<header>
			<div class="about">
				<h1>Daniel's Twenty Seventeen</h1>
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
				<article class="category-icon health">
					<a href="/health">
						${svg_health}
					</a>
				</article>
				<article class="category-icon media">
					<a href="/media">
						${svg_media}
					</a>
				</article>
				<article class="category-icon walking">
					<a href="/walking">
						${svg_walking}
					</a>
				</article>
			</div>
		</header>
		<main class="page-container"></main>
	</body>
	`),
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

		this.pageSwitcher = new ViewSwitcher({
			el: pageContainer,
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
			});
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

export default MainView;
