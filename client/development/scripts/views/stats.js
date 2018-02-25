import View from "ampersand-view";

import StatsCollection from "../models/stats";
import StatNumericMiniView from "./stat_numeric_mini";
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
		},
		loading: {
			type: "boolean",
			default: true
		},
		hiding: {
			type: "boolean",
			default: false
		}
	},
	template: `
		<section class="stats-section loading">
			<main data-hook="stats-holder">
				<div class="stamp">
					<div class="back"><a href="/" title="Back">⬅&#xFE0E;</a></div>
					<div class="icon"></div>
				</div>
			</main>
			<footer>

			</footer>
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
				selector: ".stamp .icon"
			}
		],
		loading: {
			type: "booleanClass",
			name: "loading",
			selector: ".stats-section"
		},
		hiding: {
			type: "booleanClass",
			name: "hiding",
			selector: ".stats-section"
		}
	},
	render() {
		this.renderWithTemplate(this);

		/* eslint-disable prefer-arrow-callback*/
		this.renderCollection(this.stats, function(opts) {
			const {model} = opts;

			switch (model.data.type) {
				case "numeric":
					return new StatNumericMiniView(opts);
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

		requestAnimationFrame(() => {
			if (!this.stats.length) {
				this.listenToOnce(this.stats, "sync", () => this.set("loading", false));
			} else {
				this.set("loading", false);
			}
		});

		return this;
	},
	collections: {
		stats: StatsCollection
	}
});

export default StatsView;
