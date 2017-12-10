import View from "ampersand-view";

const StatView = View.extend({
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
	bindings: {
		"model.title": {
			hook: "title"
		},
		"model.data.value": {
			hook: "value"
		}
	}
});

export default StatView;
