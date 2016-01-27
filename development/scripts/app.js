"use strict";

const app = require('ampersand-app');
const View = require("ampersand-view");
const ViewSwitcher = require('ampersand-view-switcher');
const Raven = require("raven-js");
const Router = require("./router");

Raven.config("https://b2558f5fcd4342118dfb18e1dc0883e5@app.getsentry.com/64892", {
	release: "__VERSION__",
	maxMessageLength: 512
}).install();

const MainView = View.extend({
	template: `
		<body>
			<main></main>
			<nav id="main-nav">
				<!--<a href="/">Start</a>-->
				<a href="/"><h1>Daniel's Twenty Fifteen</h1></a>
				<a data-hook="switch-modes">Switch</a>
			</nav>
		</body>
	`,
	events: {
		"click a[href]": "linkClick"
	},
	props: {
		mode: {
			type: "string",
			default: "stats"
		}
	},
	derived: {
		switch_modes_href: {
			deps: ["mode"],
			fn: function() {
				return this.mode === "stats" ? "/maps" : "/stats";
			}
		},
		switch_modes_title: {
			deps: ["mode"],
			fn: function() {
				var title = "Switch to ";
				title += this.mode === "stats" ? "Maps" : "Stats";
				return title;
			}
		}
	},
	bindings: {
		switch_modes_href: {
			type: "attribute",
			name: "href",
			hook: "switch-modes"
		},
		switch_modes_title: {
			hook: "switch-modes"
		}
	},
	setMode: function(view) {
		this.pageContainer.innerHTML = "";
		this.modeSwitcher.set(view);
	},
	setOverlay: function(view, insertBefore) {
		//this.pageContainer.parentNode.innerHTML = "";
		//this.pageSwitcher.set(view);
		view.el = document.createElement("section");
		view.render();
		
		const insertBeforeEl = insertBefore || this.pageContainer;
		insertBeforeEl.parentNode.insertBefore(view.el, insertBeforeEl);
	},
	render: function() {
		this.renderWithTemplate();
		
		this.pageContainer = this.query('main');

		this.modeSwitcher = new ViewSwitcher(this.pageContainer, {
			show: function() {
				//document.title = result(newView, "pageTitle");
				window.scrollTo(0, 0);
			}
		});
		
		return this;
	},
	linkClick: function(event) {
		const target = event.delegateTarget;
		
		if (target.host !== window.location.host) {
			return true;
		}
		
		app.router.navigate(target.pathname + target.search);
		event.preventDefault();
	}
});

app.extend({
	initialize: function () {
		this.render();
	},
	render: function() {
		const view = this.view = new MainView({
			el: document.body
		});
		
		view.render();
		
		this.router = new Router();
		this.router.on('newMode', view.setMode, view);
		this.router.on('newOverlay', view.setOverlay, view);
		this.router.history.start({
			pushState: true,
			root: "/"
		});
	}
});

app.initialize();

window.app = app;

module.exports = app;
