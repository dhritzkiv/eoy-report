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

const asyncRAF = () => new Promise(resolve => requestAnimationFrame(resolve));
const asyncSetTimemout = (delay) => new Promise(resolve => setTimeout(resolve, delay));

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
	render() {
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

		this.shimmerIcons();

		return this;
	},
	linkClick: function(event) {
		const {delegateTarget: {host, pathname, search}} = event;

		if (host !== window.location.host) {
			return true;
		}

		app.router.navigate(`${pathname}${search}`);
		event.preventDefault();
	},
	async shimmerIcons() {
		await asyncRAF();
		await asyncSetTimemout(1250);

		/** @type {HTMLElement[]} */
		let iconEls = this.queryAll(".category-icon");
		/** @type {HTMLElement} */
		const iconsHolder = this.query(".categories-list");
		const iconsHolderRect = iconsHolder.getBoundingClientRect();

		const normalizeAngle = (value, start, end) => {
			const width = end - start;
			const offsetValue = value - start;

			return (offsetValue - (Math.floor(offsetValue / width) * width)) + start;
		};

		const rad2Deg = rad => rad * (180 / Math.PI);

		const iconsCenter = {
			x: (iconsHolderRect.left + iconsHolderRect.right) / 2,
			y: (iconsHolderRect.top + iconsHolderRect.bottom) / 2
		};

		let topLeftTheta;

		const sortingGroups = iconEls
		.map(icon => ({rect: icon.getBoundingClientRect(), icon}))
		.map(({rect, icon}, index) => {
			const center = {
				x: (rect.left + rect.right) / 2,
				y: (rect.top + rect.bottom) / 2
			};

			let theta = rad2Deg(Math.atan2(center.y - iconsCenter.y, center.x - iconsCenter.x));

			if (index === 0) {
				topLeftTheta = normalizeAngle(theta, 0, 360);
			}

			theta -= topLeftTheta;
			theta = normalizeAngle(theta, 0, 360);

			return {
				theta,
				icon
			};
		})
		.sort(({theta: a}, {theta: b}) => a - b);

		iconEls = sortingGroups.map(({icon}) => icon);

		for (const iconEl of iconEls) {
			iconEl.classList.add("active");
			await asyncSetTimemout(125);

			setTimeout(() => iconEl.classList.remove("active"), 600);
		}
	}
});

export default MainView;
