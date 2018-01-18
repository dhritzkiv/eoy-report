import View from "ampersand-view";

import StatsCollection from "../models/stats";
import StatNumericMiniView from "./stat_numeric_mini";
import StatLinechartMiniView from "./stat_line_mini";
import StatBarchartMiniView from "./stat_bar_mini";
import StatHorizontalPercentageBarchartMiniView from "./stat_bar_horizontal-percentage_mini";
import StatMapMiniView from "./stat_map_mini";

const StatsView = View.extend({
	props: {
		name: {
			type: "string"
		},
		icon: {
			type: "string"
		}
	},
	template: `
		<section class="stats-section">
			<main data-hook="stats-holder">
				<div class="stamp"></div>
			</main>
		</section>
	`,
	bindings: {
		name: {
			type: "class",
			selector: "section"
		},
		icon: [
			{
				type: "toggle",
				selector: ".stamp"
			},
			{
				type: "innerHTML",
				selector: ".stamp"
			}
		]
	},
	render() {
		this.renderWithTemplate(this);

		/* eslint-disable prefer-arrow-callback*/
		this.renderCollection(this.stats, function(opts) {
			const {model} = opts;

			switch (model.data.type) {
				case "numeric":
					return new StatNumericMiniView(opts);
				case "line":
					return new StatLinechartMiniView(opts);
				case "bar":
					return new StatBarchartMiniView(opts);
				case "percentage":
					return new StatHorizontalPercentageBarchartMiniView(opts);
				case "map":
					return new StatMapMiniView(opts);
				default:
					break;
			}
		}, this.queryByHook("stats-holder"));

		/* eslint-enable prefer-arrow-callback*/

		return this;
	},
	collections: {
		stats: StatsCollection
	}
});

export default StatsView;
