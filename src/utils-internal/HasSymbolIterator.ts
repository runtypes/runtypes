type HasSymbolIterator<T> = typeof Symbol.iterator extends keyof T
	? [T[typeof Symbol.iterator]] extends [never]
		? false
		: true
	: false

export default HasSymbolIterator