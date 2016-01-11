"use strict";

const Collection = require("ampersand-collection");
const StatState = require("./stat");

module.exports = Collection.extend({
	model: StatState
});
