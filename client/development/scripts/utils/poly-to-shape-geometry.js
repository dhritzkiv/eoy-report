import {Shape, ShapeGeometry} from "three";
import addPolygonsToShape from "./add-polygons-to-shape";

function polyToShapeGeometry(polygons) {
	const shape = new Shape();

	polygons.forEach(addPolygonsToShape(shape));

	return new ShapeGeometry(shape);
}

export default polyToShapeGeometry;
