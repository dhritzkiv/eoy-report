"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const packageInfo = require(path.join(process.cwd(), "package.json"));
const publicFileDirectory = path.join(process.cwd(), "public");
const indexFileContents = fs.readFileSync(path.join(publicFileDirectory, "index.html"), "utf8");

const config = (env => {
	let configPath = path.join(process.cwd(), "config.json");

	if (env === "production") {
		configPath = path.join(process.cwd(), "config-production.json");
	}

	return require(configPath);
})(process.env.NODE_ENV);

const app = express();

app.set("title", packageInfo.name);
app.set("version", packageInfo.version);
app.set("port", process.env.PORT || config.port);

app.use(express.static(publicFileDirectory, {
	maxAge: 1000 * 60 * 60 * 24 * 7
}));

app
.route("*")
.get((req, res) => {
	res.setHeader("content-type", "text/html; charset=utf-8");
	res.send(indexFileContents);
});

app.listen(app.get("port"), () => {
	console.log(new Date());
	console.log((
		`Server for ${app.get("title")} v.${app.get("version")} ${app.settings.env} running and listening at port ${app.get("port")}`
	));
});
