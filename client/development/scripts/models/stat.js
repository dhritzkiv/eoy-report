import State from "ampersand-state";

const StatModel = State.extend({
	props: {
		title: {
			type: "string",
			default: ""
		},
		data: {
			type: "object"
		},
		tall: {
			type: "string",
			default: "y1"
		},
		wide: {
			type: "string",
			default: "x1"
		}
	},
	derived: {
		title_formatted: {
			deps: ["title"],
			fn() {
				/**@type {{title: string}} */
				const {title} = this;
				const index = title.indexOf("(");
				const parts = [];

				if (index !== -1) {
					parts.push(title.substring(0, index), title.substring(index));
				} else {
					parts.push(title);
				}

				const spans = parts
				.map((text, index) => [text, index === 1 ? "unit" : ""])
				.map(([text, className]) => `<span class="${className}">${text}</span>`).reduce((a, b) => a + b, "");

				return spans;
			}
		}
	}
});

export default StatModel;

