import Collection from "ampersand-rest-collection";
import StatModel from "./stat";

const StatsCollection = Collection.extend({
	model: StatModel
});

export default StatsCollection;
