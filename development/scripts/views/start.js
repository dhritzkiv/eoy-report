"use strict";

const View = require("ampersand-view");
const app = require("ampersand-app");
const SVG = require("svg.js");
const Matter = require("matter-js");
const {Engine, Render, World, Bodies} = Matter;
const THREE = require("three");

class SvgScene {
	constructor(el) {
		this.el = el;
		this.stage = SVG(el);
		this.children = [];

		this.update();
	}

	add(child) {
		this.children.push(child);
	}

	update() {
		requestAnimationFrame(() => this.update());

		this.children.forEach(child => child.update());
	}
}

class SvgShape {
	constructor(scene, x, y) {
		this.scene = scene;
		this.x = x;
		this.y = y;

		this.scene.add(this);
	}

	update() {

		if (!this.body || !this.svg) {
			return;
		}

		const {x, y} = this.body.bounds.min;

		this.svg.move(x, y);
	}
}

class SvgTextLetters extends SvgShape {
	constructor(scene, x, y, letters, opts = {}) {
		super(scene, x, y);

		const group = this.svg = scene.stage.nested();

		const text = this.text = group.text((add) => letters.forEach((letter) => {
			const tspan = add.tspan(letter.letter);

			tspan.attr({
				x: letter.x || 0,
				y: letter.y || 0,
				rotate: letter.rotate || 0
			});
		}));

		text.font({
			size: opts.size || 16,
			fill: opts.fill || "black",
			family: "AvenirNextCondensed-Bold",
			anchor: "middle",
			leading: "1em"
		});

		if (opts.transform !== undefined) {
			text.transform({
				rotation: -44
			});
		}

		//group.add(text);
		group.move(x, y);

		this._letters = letters;
	}

	update() {

		if (!this.body || !this.svg) {
			return;
		}

		const {bounds, position} = this.body;
		//const tbox = this.svg.bbox();

		const {x, y} = bounds.min;

		/*const w = bounds.max.x - bounds.min.x;
		const h = bounds.max.y - bounds.min.y;

		const w2 = tbox.w;
		const h2 = tbox.h;

		const dw = w2 - w;
		const dh = h2 - h;*/

		this.svg.move(x, y);
		//this.svg.move(x + dw/2, y + dh/3);
		//this.svg.center(x, y);
	}

	makeBody() {
		const text = this.text;
		const tbox = text.tbox();
		const tbox2 = this.svg.tbox();
		const w = tbox.w / this._letters.length;
		const h = tbox.h / 2;

		//const compositeBody = Matter.Composite.create();

		const letterBodies = this._letters.map((letter) => {
			const x = (letter.x || 0);
			const y = (letter.y || 0);

			const body = Bodies.rectangle(x, y, w, h);

			if (letter.rotate) {
				Matter.Body.rotate(body, THREE.Math.degToRad(letter.rotate));
			}

			return body;
		});

		const textBody = Matter.Body.create({
			parts: letterBodies
		});

		const groupBody = this.body = Matter.Body.create({
			parts: [textBody]
		});

		const rotation = text.transform("rotation");

		Matter.Body.setPosition(groupBody, {x: tbox2.cx, y: tbox2.cy});
		Matter.Body.setAngle(textBody, THREE.Math.degToRad(rotation));

		return this.body;
	}
}

class SvgRectangle extends SvgShape {
	constructor(scene, x, y, w, h, opts = {}) {
		super(scene, x, y);
		this.w = w;
		this.h = h;

		this.svg = scene.stage.rect(w, h);
		this.svg.move(x, y);

		this.svg.attr({
			fill: opts.fill || "black"
		});
	}

	makeBody() {
		this.body = Bodies.rectangle(this.x, this.y, this.w, this.h);

		return this.body;
	}
}

class SvgCircle extends SvgShape {
	constructor(scene, x, y, radius, opts = {}) {
		super(scene, x, y);
		this.radius = radius;

		this.svg = scene.stage.circle(radius * 2);
		this.svg.move(x, y);

		this.svg.attr({
			fill: opts.fill || "black"
		});
	}

	makeBody() {
		this.body = Bodies.circle(this.x, this.y, this.radius);

		return this.body;
	}
}

class Particle extends SvgShape {
	constructor(scene, x, y, path, opts = {}) {
		super(scene, x, y);

		this.svg = scene.stage.path(path);
		this.svg.move(x, y);

		this.svg.attr({
			fill: opts.fill || "black"
		});
	}
}

module.exports = View.extend({
	template: (
		`<section>
			<main>
				<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 400 400" width="400px" height="400px"></svg>
				<div></div>
			</main>
		</section>`
	),
	render: function() {
		this.renderWithTemplate(this);

		const scene = new SvgScene(this.query("svg"));
		const stage = scene.stage;

		const text = new SvgTextLetters(scene, 200, 200, [
			{
				letter: "B"
			},
			{
				letter: "E",
				rotate: -6.426,
				x: 37.79,
				y: -2.327
			},
			{
				letter: "E",
				rotate: 5.239,
				x: 65.447,
				y: -5.094
			},
			{
				letter: "R",
				rotate: 20.986,
				x: 92.617,
				y: -2.806
			}
		], {
			size: 54,
			fill: "#223BB9",
			transform: "matrix(0.7094 -0.7048 0.7048 0.7094 25.4263 110.2896)"
		});

		/*const path = "M19.369,36.76c9.089-0.504,15.377-7.176,15.848-16.19c0.47-8.995-7.464-15.725-15.848-16.19 c-9.068-0.503-15.416,7.936-15.848,16.19C3.051,29.565,10.985,36.295,19.369,36.76c5.802,0.322,5.771-8.68,0-9	c-8.887-0.493-8.887-13.888,0-14.381c8.881-0.493,8.851,13.89,0,14.381C13.599,28.08,13.567,37.082,19.369,36.76z";*/

		const rect = new SvgRectangle(scene, 200, 400, 400, 10);
		const rect2 = new SvgRectangle(scene, 200, 0, 400, 10);
		const rect3 = new SvgRectangle(scene, 0, 200, 10, 400);
		const rect4 = new SvgRectangle(scene, 400, 200, 10, 400);

		[rect, rect2, rect3, rect4].forEach(rect => {
			rect.makeBody();
			Matter.Body.setStatic(rect.body, true);
		});


		const ppath = new SvgCircle(scene, 100, 60, 16, {
			fill: "#223BB9"
		});

		const ppath2 = new SvgCircle(scene, 96, 35, 16, {
			fill: "red"
		});

		ppath.makeBody();
		ppath2.makeBody();

		[ppath, ppath2].forEach(({body}) => {
			//Matter.Body.setDensity(body, 0.00001);
			body.restitution = 0.85;
			//body.frictionAir = 0;
		});

		// create an engine
		const engine = Engine.create({
			constraintIterations: 3,
			positionIterations: 10,
			velocityIterations: 6
		});

		// add all of the bodies to the world
		World.add(engine.world, [ppath.body, ppath2.body, rect.body, rect2.body, rect3.body, rect4.body]);

		//requestAnimationFrame(() => {
		text.makeBody();

			/*const body = Bodies.rectangle(0, 0, 32, 54);

			Matter.Body.setAngle(body, -0.76794487088);

			const textBody = text.body = Matter.Body.create({
				parts: [body]
			});

			Matter.Body.setPosition(textBody, {x: text.x, y: text.y});*/

		Matter.Body.setStatic(text.body, true);
		World.add(engine.world, [text.body]);
		//});

		// run the engine
		Engine.run(engine);

		setTimeout(() => {
			const makeFloater = () => {
				const x = (Math.random() - 0.5) / 500;
				const y = -0.0015;

				Matter.Body.applyForce(ppath.body, ppath.body.position, {x, y});
			};

			Matter.Events.on(engine, "afterUpdate", makeFloater);
			setTimeout(() => Matter.Events.off(engine, "afterUpdate", makeFloater), 4000);

			//Matter.Body.setInertia(ppath.body, Infinity);
		}, 2000);


		// create a renderer
		const render = Render.create({
			element: this.query("div"),
			engine: engine,
			options: {
				height: 400,
				width: 400,
				showBounds: true,
				//showBroadphase: true,
				showPositions: true,
				hasBounds: true
			}
		});

		// run the renderer
		Render.run(render);


		return this;
	}
});
