import StatView from "./stat";
import app from "ampersand-app";

const bindings = {
	...StatView.prototype.bindings,
	"model.data.value": {
		hook: "value"
	}
};

const asyncAnimationFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

const NumericStatMiniView = StatView.extend({
	template: `
		<article class="stat">
			<header>
				<h2 data-hook="title"></h2>
			</header>
			<main>
				<h3><span data-hook="value"></span></h3>
			</main>
		</article>
	`,
	bindings,
	/**
	 *
	 * @param {HTMLSpanElement} spanEl
	 */
	async sizeTextToFit(spanEl) {
		const parentEl = spanEl.parentElement;
		let fontSizeEm = 1.0;
		let letterSpacingEm = 0;
		let affectingLetterSpacing = true;

		//reset styles
		spanEl.style.letterSpacing = `${letterSpacingEm}em`;
		spanEl.style.fontSize = `${fontSizeEm}em`;

		await asyncAnimationFrame();

		while (parentEl.clientWidth < spanEl.clientWidth) {

			if (affectingLetterSpacing && letterSpacingEm > -0.1) {
				for (let i = 0; i < 10; i++) {
					letterSpacingEm -= 0.0015;
					spanEl.style.letterSpacing = `${letterSpacingEm}em`;

					if (parentEl.clientWidth < spanEl.clientWidth) {
						break;
					}
				}
			} else {
				fontSizeEm -= 0.0125;
				spanEl.style.fontSize = `${fontSizeEm}em`;
			}

			affectingLetterSpacing = !affectingLetterSpacing;
		}

	},
	render() {
		this.renderWithTemplate();

		const valueSpan = this.queryByHook("value");
		const sizeTextToFitBound = this.sizeTextToFit.bind(this, valueSpan);

		sizeTextToFitBound();

		app.onFontLoad(sizeTextToFitBound, this);

		window.addEventListener("resize", sizeTextToFitBound);

		this.once("remove", () => window.removeEventListener("resize", sizeTextToFitBound));

		return this;
	}
});

export default NumericStatMiniView;
