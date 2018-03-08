# eoy-report

A development workspace for aggregating and displaying personal movement, location data, and other miscellany to create a end-of-year report displayable in a web browser.

## Live

See the [live version here.](https://2017.danielhritzkiv.com/)

---

## Credits

### Personal data sources

- [Strava](https://www.strava.com) for past rides geometric.
- [Moves](https://moves-app.com) for walking geometric data
- [Foursquare](https://foursquare.com)/[Swarm](https://swarmapp.com) for location checkins
- [last.fm](https://last.fm) for music listening history
- [Letterboxd](https://letterboxd.com) for movie journaling
- [Untappd](https://untappd.com) for beer checkins
- [Sleep Cycle](https://www.sleepcycle.com) for sleep tracking

### Geographic data sources

- [OpenStreetMaps](https://www.openstreetmap.org/) via Mapzen
- [Toronto OpenData](https://www.toronto.ca/city-government/data-research-maps/open-data/open-data-catalogue/)
- [Open Government Canada](https://open.canada.ca) [(Open Government License)](https://open.canada.ca/en/open-government-licence-canada)

---

## Previous years

Looking for previous years' reports?

### twenty-fifteen

- [Site](https://2015.danielhritzkiv.com)
- [Source](https://github.com/dhritzkiv/eoy-report/tree/2015)

---

## Development

### Clone and install

```sh
git clone git@github.com:dhritzkiv/eoy-report.git
cd eoy-report
npm install
```

### Build

Compile the JS (using rollup) and CSS (using Sass and PostCSS). Run the local server to serve up the site. Compile Typescript for the data scripts

#### Client JS

```sh
rollup -w -c ./client/rollup.config.js
```

#### CSS

```sh
gulp watch
```

#### Typescript

```sh
tsc -w -p data-scripts
```

#### Serve

Run `node server/server.js` to start the Express-based static server. Alternatively, serve the contents of `public/` up as static files with Nginx or similar.


## Contact

I'm [@dhritzkiv on Twitter](https://twitter.com/dhritzkiv)
