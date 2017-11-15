
/// <reference path="./polyline.d.ts" name="@mapbox/polyline"/>
import * as polyline from "@mapbox/polyline";

enum ActivityType {
	ride = "ride",
	run	 = "run",
	swim = "swim"
}

interface LatLon {
	0: number;
	1: number;
}

interface ActivityMap {
	id: string;
    polyline: string;
    summary_polyline: string;
    resource_state: number;
}

interface Activity {
	id:	number;
	name?: string;
	description?: string;
	distance: number;//meters
	moving_time: number;//seconds
	elapsed_time: number;//seconds
	total_elevation_gain: number;//meters
	elev_high: number;
	elev_low: number;
	type: ActivityType;
	start_date:	string;
	start_date_local: string;
	timezone: string;
	start_latlng?: LatLon;
	end_latlng?: LatLon;
	map?: ActivityMap;
	manual:	boolean;
	private: boolean;
	gear_id: string;
	average_speed: number;//meters per second
	max_speed: number;//meters per secod
	average_watts: number;
	kilojoules:	number;
	calories: number;
}

interface Ride extends Activity {}

/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
function enumerable(value: boolean) {
    return function (target: any, propertyKey: string) {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (descriptor.enumerable != value) {
			descriptor.enumerable = value;
            Object.defineProperty(target, propertyKey, descriptor)
        }
    };
}

/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
function writable(value: boolean) {
    return function (target: any, propertyKey: string) {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (descriptor.writable != value) {
			descriptor.writable = value;
            Object.defineProperty(target, propertyKey, descriptor)
        }
    };
}

class Ride implements Ride {
	@enumerable(false)
	@writable(true)
	private _start_date_date: Date;

	@enumerable(false)
	@writable(true)
	private _start_date_local_date: Date;

	constructor(data: Activity) {
		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
		this.distance = data.distance;//meter
		this.moving_time = data.moving_time;//second
		this.elapsed_time = data.elapsed_time;//second
		this.manual = data.manual;
		this.type = data.type;
		this.start_date = data.start_date;
		this.start_date_local = data.start_date_local;
		this.gear_id = data.gear_id;
		//this.private = data.private;
		this.average_speed = data.average_speed;//meters per secon

		if (!this.manual) {
			this.total_elevation_gain = data.total_elevation_gain;//meter
			this.elev_high = data.elev_high;
			this.elev_low = data.elev_low;
			this.timezone = data.timezone;
			this.start_latlng = data.start_latlng;
			this.end_latlng = data.end_latlng;
			this.map = data.map;
			this.max_speed = data.max_speed;//meters per seco
			this.average_watts = data.average_watts;
			this.kilojoules = data.kilojoules;
			this.calories = data.calories;
		}

		this._start_date_date = new Date(this.start_date);
		this._start_date_local_date = new Date(this.start_date_local);
	}

	@enumerable(false)
	get start_date_date() {
		return this._start_date_date;
	}

	@enumerable(false)
	get start_date_local_date() {
		return this._start_date_local_date;
	}
}

export default Ride;

export {Activity, ActivityWithMap, Ride};
