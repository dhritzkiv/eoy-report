"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IncrementalMap extends Map {
    increment(key, count = 1) {
        return this.set(key, (this.get(key) || 0) + count);
    }
}
exports.IncrementalMap = IncrementalMap;
//# sourceMappingURL=utils.js.map