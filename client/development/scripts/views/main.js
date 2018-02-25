import app from "ampersand-app";
import scroll from "scroll";
import ease from "ease-component";

import View from "ampersand-view";
import ViewSwitcher from "ampersand-view-switcher";

const MainView = View.extend({
	template: (`
	<body>
		<main class="page-container"></main>
	</body>
	`),
	events: {
		"click a[href]": "linkClick"
	},
	render() {
		this.renderWithTemplate();

		//allow :hover states on touch devices
		document.addEventListener("touchstart", () => {}, true);

		const pageContainer = this.pageContainer = this.query(".page-container");

		const transitionDuration = 500;

		this.pageSwitcher = new ViewSwitcher({
			el: pageContainer,
			waitForRemove: true,
			hide(oldView, callback) {
				scroll.top(document.scrollingElement, pageContainer.offsetTop, {
					duration: transitionDuration,
					ease: ease.inOutQuart
				});

				oldView.hiding = true;
				setTimeout(callback, transitionDuration);
			},
			show: (newView) => {

				if (!newView) {
					return;
				}
			}
		});

		return this;
	},
	linkClick: function(event) {
		const {delegateTarget: {host, pathname, search}} = event;

		if (host !== window.location.host) {
			return true;
		}

		app.router.navigate(`${pathname}${search}`);
		event.preventDefault();
	}
});

export default MainView;
