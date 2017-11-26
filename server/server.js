"use strict";

const path = require("path");
const express = require("express");
const app = express();

const config = require("../.env.json");

const {PORT} = config;
const STATIC_ROOT = path.resolve(__dirname, "../client/public");

app.use(express.static(STATIC_ROOT));

app.get("*", (req, res) => res.sendFile("./index.html", {
	root: STATIC_ROOT
}));

app.listen(PORT, () => console.log(`Listening on :${PORT}`));
