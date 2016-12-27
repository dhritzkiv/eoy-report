"use strict";

const app = require('ampersand-app');
const View = require("ampersand-view");
const ViewSwitcher = require('ampersand-view-switcher');
//const Raven = require("raven-js");
const Router = require("./router");

/*Raven.config("https://b2558f5fcd4342118dfb18e1dc0883e5@app.getsentry.com/64892", {
	release: "__VERSION__",
	maxMessageLength: 512
}).install();*/

const MainView = View.extend({
	template: `
		<body></body>
	`,
	events: {
		"click a[href]": "linkClick"
	},
	setMode: function(view) {
		this.pageContainer.innerHTML = "";
		this.modeSwitcher.set(view);
	},
	setOverlay: function(view, insertBefore) {
		view.el = document.createElement("section");
		view.render();

		const insertBeforeEl = insertBefore || this.pageContainer;
		insertBeforeEl.parentNode.insertBefore(view.el, insertBeforeEl);
	},
	render: function() {
		this.renderWithTemplate();

		this.pageContainer = this.query('body');

		this.modeSwitcher = new ViewSwitcher(this.pageContainer, {
			show: function() {
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

		/*ga('create', "UA-47020641-4", {
			'siteSpeedSampleRate': 50
		});*/

		this.render();
	},
	render: function() {
		const view = this.view = new MainView({
			el: document.body
		});

		view.render();

		this.router = new Router();
		//this.router.on('newMode', view.setMode, view);
		this.router.on('newOverlay', view.setOverlay, view);

		this.router.on('navigation', function() {
			const path = window.location.pathname + window.location.search + window.location.hash;

			/*ga('set', 'page', path);
			ga('send', 'pageview', {
				page: path,
				title: document.title
			});*/
		});

		this.router.history.start({
			pushState: true,
			root: "/"
		});
	}
});

/* Google Analytics */
/*(function() {
	window.GoogleAnalyticsObject = 'ga';
	var sciptTagName = 'script';

	window.ga = function() {
		(ga.q = ga.q || []).push(arguments);
	};

	ga.l = (new Date()).getTime();

	var script = document.createElement(sciptTagName);
	script.async = true;
	script.src = 'https://www.google-analytics.com/analytics.js';

	var prevScript = document.getElementsByTagName(sciptTagName)[0];
	prevScript.parentNode.insertBefore(script, prevScript);
})();*/

window.app = app;

app.initialize();

module.exports = app;
