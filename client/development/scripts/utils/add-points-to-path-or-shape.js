function addPointsToPathOrShape(pathOrShape) {
	return function(point, index) {
		if (index === 0) {
			pathOrShape.moveTo(point[0], point[1]);
		} else {
			pathOrShape.lineTo(point[0], point[1]);
		}
	};
}

export default addPointsToPathOrShape;
