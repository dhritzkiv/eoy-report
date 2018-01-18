"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IncrementalMap extends Map {
    increment(key, count = 1) {
        return this.set(key, (this.get(key) || 0) + count);
    }
}
exports.IncrementalMap = IncrementalMap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxvQkFBd0IsU0FBUSxHQUFjO0lBQzdDLFNBQVMsQ0FBQyxHQUFLLEVBQUUsS0FBSyxHQUFHLENBQUM7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0Q7QUFnQ08sd0NBQWMifQ==