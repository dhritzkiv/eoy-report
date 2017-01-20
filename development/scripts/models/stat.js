"use strict";

const State = require("ampersand-state");
const moment = require("moment");

require("moment-duration-format");
const numeral = require("numeral");

module.exports = State.extend({
	props: {
		title: {
			type: "string"
		},
		value: {
			type: "any"
		},
		value_type: {
			type: "string"
		},
		alt_text: {
			type: "string"
		},
		secondary_value: {
			type: "string"
		}
	},
	derived: {
		value_formatted: {
			deps: ["value", "value_type"],
			fn: function() {

				let formattedValue = this.value;
				let duration = null;

				switch (this.value_type) {
					case "m":
					case "km":
						//formattedValue = this.value;
						formattedValue = numeral(this.value).format("0,0[.]00");
						break;
					case "min":
					case "mins":
					case "minute":
					case "minutes":
						duration = moment.duration(this.value, "minutes");
						formattedValue = duration.format("m:ss");
						break;
					case "h":
					case "hr":
					case "hrs":
					case "hours":
						duration = moment.duration(this.value, "hours");
						formattedValue = duration.format("h:mm");
						break;
					default:

						if (!isNaN(this.value)) {
							formattedValue = numeral(this.value).format("0,0[.]00");
						} else {
							formattedValue = formattedValue.toString();
						}
				}

				return formattedValue;
			}
		},
		secondary_value_formatted: {
			deps: ["secondary_value"],
			fn: function() {

				const value = this.secondary_value;

				if (!value) {
					return "";
				}

				const date = moment(new Date(value));

				if (date.isValid()) {
					return date.format("LL");
				} else {
					return value;
				}
			}
		}
	}
});

