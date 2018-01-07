
class IncrementalMap<T> extends Map<T, number> {
	increment(key:T, count = 1) {
		return this.set(key, (this.get(key) || 0) + count);
	}
}

interface SimpleFoursquareCheckin {
	venue_id: string;
	venue_name: string;
	venue_categories: string[];
	venue_location: {lat: number, lng: number};
	venue_cc: string;
	venue_city: string;
	venue_state: string;
	date: Date;
	with?: string[];
}

export {IncrementalMap, SimpleFoursquareCheckin};
