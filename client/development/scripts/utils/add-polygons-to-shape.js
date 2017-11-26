import {Path, Vector2} from "three";
import addPointsToPathOrShape from "./add-points-to-path-or-shape.js";

function addPolygonsToShape(shape) {
	return function(polygon, index) {
		if (!index) {
			polygon.forEach(addPointsToPathOrShape(shape));
		} else {
			const path = new Path(polygon.map((point) => new Vector2(point[0], point[1])));
			//polygon.forEach(addPointsToPathOrShape(path));

			shape.holes.push(path);
		}
	};
}

export default addPolygonsToShape;
