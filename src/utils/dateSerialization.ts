import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { DateTime } from 'luxon';

export function serializeDates(obj: unknown): unknown {
	if (obj instanceof Date) {
		return { $date: obj.toISOString() };
	}

	if (isArray(obj)) {
		return obj.map(serializeDates);
	}

	if (isObject(obj)) {
		return Object.keys(obj).reduce(
			(acc, key) => Object.assign(acc, { [key]: serializeDates(get(obj, key)) }),
			{},
		);
	}

	return obj;
}

export function deserializeDates(obj: unknown): unknown {
	if (get(obj, '$date') != null) {
		return DateTime.fromISO(get(obj, '$date')).toJSDate();
	}
	if (typeof obj === 'string' && DateTime.fromISO(obj).isValid) {
		try {
			if (new Date(obj).toISOString() === obj) {
				return DateTime.fromISO(obj).toJSDate();
			}
		} catch {
			// ignore
		}
	}

	if (isArray(obj)) {
		return obj.map(deserializeDates);
	}

	if (isObject(obj)) {
		return Object.keys(obj).reduce(
			(acc, key) => Object.assign(acc, { [key]: deserializeDates(get(obj, key)) }),
			{},
		);
	}

	return obj;
}
