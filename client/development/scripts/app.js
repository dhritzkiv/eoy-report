import app from "ampersand-app";
//const Raven = require("raven-js");
import Router from "./router";
import MainView from "./views/main";

/*Raven.config("https://b2558f5fcd4342118dfb18e1dc0883e5@app.getsentry.com/64892", {
	release: "__VERSION__",
	maxMessageLength: 512
}).install();*/

app.extend({
	initialize: function() {

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
		this.router.on("newPage", view.pageSwitcher.set, view.pageSwitcher);

		this.router.on("navigation", () => {
			//const path = window.location.pathname + window.location.search + window.location.hash;

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
	},
	onFontLoad(callback, thisArg) {
		if (!this.fontsLoaded) {
			let fontLoadArgs;

			const fontLoadHandler = () => {
				app.off(...fontLoadArgs);
				callback();
			};

			fontLoadArgs = ["fontsactive", fontLoadHandler];

			app.on(...fontLoadArgs);

			thisArg.once("remove", () => app.off(...fontLoadArgs));
		}
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

(function(d) {
	const config = {
		kitId: "mcd6sge",
		scriptTimeout: 3000,
		async: true,
		active: () => {
			app.emit("fontsactive");
			app.fontsLoaded = true;
		}
	};

	const h = d.documentElement;
	const t = setTimeout(() => {
		h.className = `${h.className.replace(/\bwf-loading\b/g,"")} wf-inactive`;
	},config.scriptTimeout);
	const tk = d.createElement("script");
	let f = false;
	const s = d.getElementsByTagName("script")[0];
	let a;

	h.className += " wf-loading";tk.src = `https://use.typekit.net/${ config.kitId }.js`;tk.async = true;

	tk.onload = tk.onreadystatechange = function() {
		a = this.readyState;

		if(f || a && a !== "complete" && a !== "loaded") {
			return;
		}

		f = true;clearTimeout(t);

		try{
			window.Typekit.load(config);
		} catch(e) {}
	};

	s.parentNode.insertBefore(tk,s);
}(document));

window.app = app;

app.initialize();

export default app;
