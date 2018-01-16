"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./polyline.d.ts" name="@mapbox/polyline"/>
const polyline = require("@mapbox/polyline");
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
        if (this.map) {
            this._mapline = polyline.decode(this.map.polyline);
        }
    }
    get start_date_date() {
        return this._start_date_date;
    }
    get start_date_local_date() {
        return this._start_date_local_date;
    }
    get mapline() {
        return this._mapline;
    }
    get mapline_interop() {
        return this._mapline_interop;
    }
    set mapline_interop(val) {
        this._mapline_interop = val;
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
    enumerable(false),
    writable(true)
], Ride.prototype, "_mapline", void 0);
__decorate([
    enumerable(false),
    writable(true)
], Ride.prototype, "_mapline_interop", void 0);
__decorate([
    enumerable(false)
], Ride.prototype, "start_date_date", null);
__decorate([
    enumerable(false)
], Ride.prototype, "start_date_local_date", null);
__decorate([
    enumerable(false)
], Ride.prototype, "mapline", null);
__decorate([
    enumerable(false)
], Ride.prototype, "mapline_interop", null);
exports.Ride = Ride;
exports.default = Ride;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXZhLWFjdGl2aXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RyYXZhLWFjdGl2aXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQSwrREFBK0Q7QUFDL0QsNkNBQTZDO0FBRTdDLElBQUssWUFJSjtBQUpELFdBQUssWUFBWTtJQUNoQiw2QkFBYSxDQUFBO0lBQ2IsMkJBQVksQ0FBQTtJQUNaLDZCQUFhLENBQUE7QUFDZCxDQUFDLEVBSkksWUFBWSxLQUFaLFlBQVksUUFJaEI7QUEyQ0Q7OztHQUdHO0FBQ0gsb0JBQW9CLEtBQWM7SUFDOUIsTUFBTSxDQUFDLFVBQVUsTUFBVyxFQUFFLFdBQW1CO1FBQzdDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMxQyxVQUFVLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUNyQixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDMUQsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNOLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxrQkFBa0IsS0FBYztJQUM1QixNQUFNLENBQUMsVUFBVSxNQUFXLEVBQUUsV0FBbUI7UUFDN0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxV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