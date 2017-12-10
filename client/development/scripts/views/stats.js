import View from "ampersand-view";

import StatsCollection from "../models/stats";
import MiniStatView from "./stat_mini";

const StatsView = View.extend({
	template: `
		<section class="stats-section">
			<main data-hook="stats-holder"></main>
		</section>
	`,
	render() {
		this.renderWithTemplate(this);

		this.renderCollection(this.stats, MiniStatView, this.queryByHook("stats_holder"));

		return this;
	},
	stats: new StatsCollection()
});

export default StatsView;
