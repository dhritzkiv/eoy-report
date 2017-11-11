"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityType;
(function (ActivityType) {
    ActivityType["ride"] = "ride";
    ActivityType["run"] = "run";
    ActivityType["swim"] = "swim";
})(ActivityType || (ActivityType = {}));
/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
function enumerable(value) {
    return function (target, propertyKey) {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (descriptor.enumerable != value) {
            descriptor.enumerable = value;
            Object.defineProperty(target, propertyKey, descriptor);
        }
    };
}
/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
function writable(value) {
    return function (target, propertyKey) {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
        if (descriptor.writable != value) {
            descriptor.writable = value;
            Object.defineProperty(target, propertyKey, descriptor);
        }
    };
}
class Ride {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.distance = data.distance; //meter
        this.moving_time = data.moving_time; //second
        this.elapsed_time = data.elapsed_time; //second
        this.manual = data.manual;
        this.type = data.type;
        this.start_date = data.start_date;
        this.start_date_local = data.start_date_local;
        this.gear_id = data.gear_id;
        //this.private = data.private;
        this.average_speed = data.average_speed; //meters per secon
        if (!this.manual) {
            this.total_elevation_gain = data.total_elevation_gain; //meter
            this.elev_high = data.elev_high;
            this.elev_low = data.elev_low;
            this.timezone = data.timezone;
            this.start_latlng = data.start_latlng;
            this.end_latlng = data.end_latlng;
            this.map = data.map;
            this.max_speed = data.max_speed; //meters per seco
            this.average_watts = data.average_watts;
            this.kilojoules = data.kilojoules;
            this.calories = data.calories;
        }
        this._start_date_date = new Date(this.start_date);
        this._start_date_local_date = new Date(this.start_date_local);
    }
    get start_date_date() {
        return this._start_date_date;
    }
    get start_date_local_date() {
        return this._start_date_local_date;
    }
}
__decorate([
    enumerable(false),
    writable(true)
], Ride.prototype, "_start_date_date", void 0);
__decorate([
    enumerable(false),
    writable(true)
], Ride.prototype, "_start_date_local_date", void 0);
__decorate([
    enumerable(false)
], Ride.prototype, "start_date_date", null);
__decorate([
    enumerable(false)
], Ride.prototype, "start_date_local_date", null);
exports.default = Ride;
//# sourceMappingURL=strava-activities.js.map