# moves-gl-2015

A development workspace for getting and displaying personal movement and location data to create a end-of-year movement report à la Nicholas Felton's Annual Report (but light). The data will be displayed on a HTML page using WebGL (via Three.js).

The data sources include:
- Strava for past rides and planned routes.
- Moves for walking
- Foursquare/Swarm for checkins
- Instagram for photos

This repo includes scripts for:
- querying and fetching data from the source
- filtering it
	- to only include data from 2015, data only for Ontario, etc.
- simplifying it
	- some data can be duplicates that can't be displayed well in 2D (subsequent checkins to a venue, commutes rides and walks)
    
    
It's currently messy, but the hope is that once finished, I can clean up the repo so that anyone can shape it to their own needs.
