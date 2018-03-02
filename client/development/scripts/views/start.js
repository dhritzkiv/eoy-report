import View from "ampersand-view";
import shuffle from "lodash/shuffle";

import {svg_coffee, svg_beer, svg_cycling, svg_health, svg_media, svg_walking} from "../utils/icons";

const asyncRAF = () => new Promise(resolve => requestAnimationFrame(resolve));
const asyncSetTimemout = (delay) => new Promise(resolve => setTimeout(resolve, delay));

const StartView = View.extend({
	pageTitle: "Daniel's Twenty Seventeen",
	props: {
		hiding: {
			type: "boolean",
			default: true
		}
	},
	bindings: {
		hiding: {
			type: "booleanClass",
			name: "hiding",
			selector: "#start"
		}
	},
	events: {
		"mousemove .categories-list": "delayShimmer",
		"touchmove .categories-list": "delayShimmer"
	},
	template: `
		<header id="start">
			<div class="about">
				<h1>Daniel's Twenty Seventeen</h1>
			</div>

			<div class="categories-list">
				<article class="category-icon coffee">
					<a href="/coffee" alt="Icon for coffee stats">
						${svg_coffee}
					</a>
				</article>
				<article class="category-icon cycling">
					<a href="/cycling" alt="Icon for cycling stats">
						${svg_cycling}
					</a>
				</article>
				<article class="category-icon beer">
					<a href="/beer" alt="Icon for beer stats">
						${svg_beer}
					</a>
				</article>
				<article class="category-icon health">
					<a href="/health" alt="Icon for health stats">
						${svg_health}
					</a>
				</article>
				<article class="category-icon walking">
					<a href="/walking" alt="Icon for walking stats">
						${svg_walking}
					</a>
				</article>
				<article class="category-icon media">
					<a href="/media" alt="Icon for media stats">
						${svg_media}
					</a>
				</article>
			</div>
		</header>
	`,
	render() {
		this.renderWithTemplate();

		requestAnimationFrame(() => (this.hiding = false));

		const categoryIconsExtrasHolders = this.queryAll(".category-icon svg .extras");

		categoryIconsExtrasHolders.forEach(holder => {
			const children = shuffle(Array.from(holder.children));

			children.forEach((extra, index) => {
				const delay = 50 + (index * 25);

				extra.style.transitionDelay = `${delay}ms`;
			});
		});

		this.delayShimmer();

		this.once("remove", () => clearTimeout(this.shimmerTimer));

		return this;
	},
	delayShimmer() {
		clearTimeout(this.shimmerTimer);

		this.shimmerTimer = setTimeout(() => this.shimmerIcons(), 5000);
	},
	async shimmerIcons() {
		await asyncRAF();

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

		this.delayShimmer();
	}
});

export default StartView;
