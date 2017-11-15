declare module "@mapbox/polyline" {

	interface LatLonTuple extends Array<number> { 0: number; 1: number; }

	interface GeoJSON {
		type?: string;
		geometry: {
			type?: string,
			coordinates: LatLonTuple[]
		},
		properties?: {}
	}

	export function decode(polyline: string, precision?: number): LatLonTuple[];
	export function encode(coordinates: LatLonTuple[], precision?: number): string;
	export function fromGeoJSON(geoJSON: GeoJSON, precision?: number): string;
	export function toGeoJSON(coordinates: LatLonTuple[], precision?: number): GeoJSON;
}
