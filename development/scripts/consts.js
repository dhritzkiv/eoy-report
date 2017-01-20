"use strict";

const consts = module.exports = {};

consts.CAMERA_NEAR = 500;

consts.RENDER_ORDER_FEATURES = 0;
consts.RENDER_ORDER_FEATURE_MAP = 0.1;
consts.RENDER_ORDER_TEXT = 0.2;
consts.RENDER_ORDER_LINES = 0.3;
consts.RENDER_ORDER_LINES_RIDES = 0.31;
consts.RENDER_ORDER_LINES_WALKS = 0.32;
consts.RENDER_ORDER_PLACES = 0.4;
consts.RENDER_ORDER_LABELS = 0.5;

consts.LABEL_SIZE_METRO = 1;
consts.LABEL_SIZE_MEDIUM = 0.8;
consts.LABEL_SIZE_SMALL = 0.7;
consts.LABEL_SIZE_NANO = 0.55;

consts.COLOR_LAND = "#f4e1c7";
consts.COLOR_ROADS_MINOR = "#ebe8e6";
consts.COLOR_ROADS_MAJOR = "#e5e3e1";
consts.COLOR_ROADS_TRANSIT = "#e2ccaf";//not really roads
consts.COLOR_PARKS = "#f0cf99";
consts.COLOR_WATER = "#b6b6b8";
consts.COLOR_TEXT = "#16385d";
consts.COLOR_AIRPORT_GROUNDS = "#ebd3b2";
consts.COLOR_AIRPORT_FEATURES = "#dbc5a7";
consts.COLOR_BUILDINGS = "#dbc5a7";
consts.COLOR_CHECKIN_POINT = "#353a3d";
consts.COLOR_LINES_WALKS = "#44c0c2";
consts.COLOR_LINES_RIDES = "#0f9e5b";//"#d1368e";

consts.PROJECTION_WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
consts.PROJECTION_MTM10 = "+proj=tmerc +lat_0=0 +lon_0=-79.5 +k=0.9999 +x_0=304800 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
consts.PROJECTION_UTM17 = "+proj=utm +zone=17 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
consts.PROJECTION_OREGON_NORTH = "+proj=lcc +lat_1=44.33333333333334 +lat_2=46 +lat_0=43.66666666666666 +lon_0=-120.5 +x_0=2500000 +y_0=0 +ellps=GRS80 +units=m +no_defs";
consts.PROJECTION_NEW_YORK_ISLAND = "+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
consts.PROJECTION_NEVADA_WEST = "+proj=tmerc +lat_0=34.75 +lon_0=-118.5833333333333 +k=0.9999 +x_0=800000 +y_0=4000000 +ellps=GRS80 +units=m +no_defs";
