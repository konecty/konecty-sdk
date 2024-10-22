export default async function getGeolocation(): Promise<GeolocationCoordinates | null> {
	return new Promise(resolve => {
		globalThis.window.navigator.geolocation.getCurrentPosition(
			({ coords }) => resolve(coords),
			() => resolve(null),
			{ enableHighAccuracy: false },
		);
	});
}

type Coords = { latitude: number; longitude: number };

export async function watchGeolocation(callback: (coords: Coords) => void): Promise<void> {
	let lastPosition: Coords | null = null;
	globalThis.window.navigator.geolocation.watchPosition(({ coords }) => {
		if (lastPosition == null) {
			lastPosition = coords;
			return callback(coords);
		}

		if (distance(lastPosition, coords) > 0.1) {
			lastPosition = Object.assign({}, coords);
			callback(coords);
		}
	});
}

function distance(fromCoords: Coords, toCoords: Coords): number {
	const R = 6371; // Radius of the earth in km
	const dLat = toRadians(toCoords.latitude - fromCoords.latitude);
	const dLon = toRadians(toCoords.longitude - fromCoords.longitude);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(fromCoords.latitude)) * Math.cos(toRadians(toCoords.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c; // Distance in km
	return d;
}

function toRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}
