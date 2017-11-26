import View from "ampersand-view";
import app from "ampersand-app";
import * as THREE from "three";

module.exports = View.extend({
	template: (
		`<section>
			<main>
				<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 400 400" width="400px" height="400px"></svg>
				<div></div>
			</main>
		</section>`
	),
	render: function() {
		this.renderWithTemplate(this);


		return this;
	}
});
