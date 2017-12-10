import Collection from "ampersand-collection";
import StatModel from "./stat";

const StatsCollection = Collection.extend({
	model: StatModel
});

export default StatsCollection;
