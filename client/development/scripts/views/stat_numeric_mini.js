import StatView from "./stat";

const bindings = {
	...StatView.prototype.bindings,
	"model.data.value": {
		hook: "value"
	}
};

const NumericStatMiniView = StatView.extend({
	template: `
		<article class="stat">
			<header>
				<h2 data-hook="title"></h2>
			</header>
			<main>
				<h3 data-hook="value"></h3>
			</main>
		</article>
	`,
	bindings
});

export default NumericStatMiniView;
