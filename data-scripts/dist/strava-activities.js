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
exports.Ride = Ride;
class RideWithMap extends Ride {
    constructor(data) {
        super(data);
        this._mapline = polyline.decode(this.map.polyline);
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
], RideWithMap.prototype, "_mapline", void 0);
__decorate([
    enumerable(false),
    writable(true)
], RideWithMap.prototype, "_mapline_interop", void 0);
__decorate([
    enumerable(false)
], RideWithMap.prototype, "mapline", null);
__decorate([
    enumerable(false)
], RideWithMap.prototype, "mapline_interop", null);
exports.RideWithMap = RideWithMap;
exports.default = Ride;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXZhLWFjdGl2aXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RyYXZhLWFjdGl2aXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQSwrREFBK0Q7QUFDL0QsNkNBQTZDO0FBRTdDLElBQUssWUFJSjtBQUpELFdBQUssWUFBWTtJQUNoQiw2QkFBYSxDQUFBO0lBQ2IsMkJBQVksQ0FBQTtJQUNaLDZCQUFhLENBQUE7QUFDZCxDQUFDLEVBSkksWUFBWSxLQUFaLFlBQVksUUFJaEI7QUErQ0Q7OztHQUdHO0FBQ0gsb0JBQW9CLEtBQWM7SUFDOUIsTUFBTSxDQUFDLFVBQVUsTUFBVyxFQUFFLFdBQW1CO1FBQzdDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMxQyxVQUFVLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUNyQixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDMUQsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNOLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxrQkFBa0IsS0FBYztJQUM1QixNQUFNLENBQUMsVUFBVSxNQUFXLEVBQUUsV0FBbUI7UUFDN0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUMxRCxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUVEO0lBU0MsWUFBWSxJQUFjO1FBQ3pCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBLE9BQU87UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUEsUUFBUTtRQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQSxRQUFRO1FBQzlDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLDhCQUE4QjtRQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQSxrQkFBa0I7UUFFMUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUEsT0FBTztZQUM3RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQSxpQkFBaUI7WUFDakQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFHRCxJQUFJLGVBQWU7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUM5QixDQUFDO0lBR0QsSUFBSSxxQkFBcUI7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztJQUNwQyxDQUFDO0NBQ0Q7QUFoREE7SUFGQyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUM7OENBQ2dCO0FBSS9CO0lBRkMsVUFBVSxDQUFDLEtBQUssQ0FBQztJQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDO29EQUNzQjtBQW9DckM7SUFEQyxVQUFVLENBQUMsS0FBSyxDQUFDOzJDQUdqQjtBQUdEO0lBREMsVUFBVSxDQUFDLEtBQUssQ0FBQztpREFHakI7QUFtQ3FDLG9CQUFJO0FBaEMzQyxpQkFBa0IsU0FBUSxJQUFJO0lBdUI3QixZQUFZLElBQWM7UUFDekIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQWpCRCxJQUFJLE9BQU87UUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN0QixDQUFDO0lBR0QsSUFBSSxlQUFlO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQUksZUFBZSxDQUFDLEdBQUc7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztJQUM3QixDQUFDO0NBT0Q7QUF6QkE7SUFGQyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUM7NkNBQzBCO0FBSXpDO0lBRkMsVUFBVSxDQUFDLEtBQUssQ0FBQztJQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDO3FEQUNtQztBQUdsRDtJQURDLFVBQVUsQ0FBQyxLQUFLLENBQUM7MENBR2pCO0FBR0Q7SUFEQyxVQUFVLENBQUMsS0FBSyxDQUFDO2tEQUdqQjtBQWUyQyxrQ0FBVztBQUZ4RCxrQkFBZSxJQUFJLENBQUMifQ==