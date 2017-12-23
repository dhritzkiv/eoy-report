import View from "ampersand-view";

const StatView = View.extend({
	template: `
	<article class="stat">
		<header>
			<h2 data-hook="title"></h2>
		</header>
		<main>
			<div data-hook="viz-holder">
				<svg></svg>
			</div>
		</main>
	</article>
	`,
	render() {
		this.renderWithTemplate(this);

		const vizEl = this.queryByHook("viz-holder");

		this.buildChart(vizEl, this.model.data.value);

		return this;
	},
	bindings: {
		"model.title": {
			hook: "title"
		},
		"model.tall": {
			type: "class",
			selector: "article"
		},
		"model.wide": {
			type: "class",
			selector: "article"
		}
	}
});

export default StatView;
