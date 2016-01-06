"use strict";

const View = require("ampersand-view");

module.exports = View.extend({
	session: {
		fontSize: {
			type: "number",
			default: 48
		},
		adjusted_fontSize: {
			type: "number"
		},
		letter_spacing: {
			type: "number"
		},
		maxWidth: {
			type: "number",
			default: 220
		}
	},
	initialize: function() {
		
		this.on("change:letter_spacing change:fontSize", function() {
			const letterSpacing = parseFloat(this.letter_spacing) || 0;
			const fontSize = (this.adjusted_fontSize || this.fontSize);
					
			if (letterSpacing < -2) {
				this.adjusted_fontSize = fontSize - 1;
			}
		});
		
		this.on("change:adjusted_fontSize change:fontSize change:maxWidth change:model.value_formatted", function() {
			const value = this.model.value_formatted;
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			
			const fontFamily = '"Futura PT", Futura, futura, sans-serif';
			
			const maxWidth = this.maxWidth - 20;//220-10-10;
			const originalFontSize = this.fontSize;
			
			let fontSize = this.adjusted_fontSize || originalFontSize;
			
			context.font = `${fontSize}px ${fontFamily}`;
			
			const measured = context.measureText(value);
			
			if (measured.width > maxWidth) {
				const difference = maxWidth - measured.width;
				const charLength = value.replace(/[\.,]/g,"").length;
				const letterSpacing = difference / charLength;
				this.letter_spacing = letterSpacing;
				return
			}
		});
	},
	render: function() {
		this.renderWithTemplate(this);
		
		const h3 = this.query("h3");
		
		requestAnimationFrame(() => {
			const h3Style = window.getComputedStyle(h3);
			this.fontSize = parseFloat(h3Style.fontSize);
			this.maxWidth = parseFloat(h3.parentNode.clientWidth);
		});
				
		return this;
	},
	derived: {
		full_title: {
			deps: ["model.title", "model.value_type"],
			fn: function() {
				 
				let string = `${this.model.title}`;
				
				if (this.model.value_type) {
					string += ` <span class="si-unit">(${this.model.value_type})</span>`;
				}
				
				return string;
			}
		}
	},
	template: `
		<article>
			<h4></h4>
			<h3></h3>
			<h5></h5>
		</artice>
	`,
	bindings: {
		full_title: {
			type: "innerHTML",
			selector: "h4"
		},
		"model.value_formatted": {
			selector: "h3"
		},
		"model.secondary_value_formatted": {
			selector: "h5"
		},
		adjusted_fontSize: {
			type: function(el, val) {
				if (val) {
					el.style.fontSize = val + "px";
				}
			},
			selector: "h3"
		},
		letter_spacing: {
			type: function(el, val) {
				if (val) {
					el.style.letterSpacing = val + "px";
				}
			},
			selector: "h3"
		}
	}
});
