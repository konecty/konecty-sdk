/**
 * Consumes a ReadableStream or string of NDJSON (one JSON object per line) and yields
 * parsed objects. Optionally applies a transform (e.g. deserializeDates) to each object.
 */
export async function* readNdjsonStream<T = object>(
	stream: ReadableStream<Uint8Array> | null | string,
	transform?: (obj: unknown) => T,
): AsyncGenerator<T> {
	if (stream == null) {
		return;
	}

	if (typeof stream === 'string') {
		for (const line of stream.split('\n')) {
			const trimmed = line.trim();
			if (trimmed.length === 0) continue;
			try {
				const parsed = JSON.parse(trimmed) as unknown;
				yield (transform != null ? transform(parsed) : parsed) as T;
			} catch {
				// skip invalid JSON lines
			}
		}
		return;
	}

	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';
			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed.length === 0) continue;
				try {
					const parsed = JSON.parse(trimmed) as unknown;
					yield (transform != null ? transform(parsed) : parsed) as T;
				} catch {
					// skip invalid JSON lines (e.g. comments or empty)
				}
			}
		}
		// remaining buffer
		if (buffer.trim().length > 0) {
			try {
				const parsed = JSON.parse(buffer.trim()) as unknown;
				yield (transform != null ? transform(parsed) : parsed) as T;
			} catch {
				// skip
			}
		}
	} finally {
		reader.releaseLock();
	}
}
