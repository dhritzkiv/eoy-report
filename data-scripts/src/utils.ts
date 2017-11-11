
class IncrementalMap<T> extends Map<T, number> {
	increment(key:T, count = 1) {
		return this.set(key, (this.get(key) || 0) + count);
	}
}

export {IncrementalMap};
