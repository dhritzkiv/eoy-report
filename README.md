# twenty-fifteen

A development workspace for retrieving and displaying personal movement, location data, and miscellaneous to create a end-of-year report displayable in a web browser.

## Live

See the [live version here.](https://2015.danielhritzkiv.com/)

## Development

### Clone and install

```sh
git clone
cd twenty-fifteen
npm install
```

### Build

```sh
gulp build
#or
gulp watch
```

To compile the JS (using Browserify and Babel) and CSS (using Sass and PostCSS)

### Release

```sh
gulp release
```

### Serve

Run `node index` to start the Express-based static server. Alternatively, serve the contents of `public/` up as static files with Nginx or similar.

## Credits

### Code

- [@mrdoob](https://github.com/mrdoob) for three.js
- [@spite](https://github.com/spite) for THREE.MeshLine
- [@AmpersandJS](https://github.com/Ampersand) for the AmpersandJS framework and suite of modules
- and lots more. See `package.json` for the modules used.

### Personal data sources

- Strava for past rides geometric.
- Moves for walking geometric data
- Foursquare/Swarm for checkins
- iTunes, last.fm, Apple Health, Untappd, and more.

### Map data sources

- OpenStreetMaps / Mapzen
- Toronto OpenData
- Statistics Canada
- Center for Urban Research at the Graduate Center @ CUNY
- Oregon Geospatial Enterprise Office

### Making it your own

This repo includes scripts for:

- querying and fetching data from the source
- filtering it
	- to only include data from 2015, data only for Ontario, etc.
- simplifying it
	- some data can be duplicates that can't be displayed well in 2D (subsequent checkins to a venue, commutes rides and walks)
	
Note: a lot of the scripts in the `data-scripts/` directory contain or rely on hardcoded values specific to me. As well, these scripts come without documentation at this time.
    
## Not implemented

- Instagram photos displayed on the map
- Interactive Swarm checkins

## To do

- Reorganize the code. Unlikely to happen unless someone is interested in repurposing this.

## Contact

I'm [@dhritzkiv on Twitter](https://twitter.com/dhritzkiv)
