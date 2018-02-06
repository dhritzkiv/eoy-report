"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const assert = require("assert");
const path = require("path");
const minimist = require("minimist");
const musicbrainz = require("musicbrainz");
const util_1 = require("util");
const args = minimist(process.argv.slice(2));
const { _: [inFile, outFile] } = args;
assert.ok(inFile, "Missing input file argument");
assert.ok(outFile, "Missing output file argument");
const writePath = path.resolve(process.cwd(), outFile);
const allTracks = JSON.parse(fs.readFileSync(path.join(process.cwd(), inFile), "utf8"));
let cache = [];
try {
    cache.push(...JSON.parse(fs.readFileSync(path.join(process.cwd(), outFile), "utf8")));
}
catch (e) { }
const asyncWriteFile = util_1.promisify(fs.writeFile);
const asyncSearchReleases = util_1.promisify(musicbrainz.searchReleases.bind(musicbrainz));
const asyncLookupRelease = util_1.promisify(musicbrainz.lookupRelease.bind(musicbrainz));
const main = async () => {
    //const uniqueTracksMap = new Map<string, CleanedTrack>();
    const uniqueAlbumsMap = new Map();
    /*allTracks
    .map(track => ({key: `${track.name}_${track.album}_${track.artist}`, value: track}))
    .forEach(({key, value}) => {
        if (!uniqueTracksMap.has(key)) {
            uniqueTracksMap.set(key, value);
        }
    });*/
    allTracks
        .filter(track => track.album)
        .map(track => ({ key: `${track.album}_${track.artist}`, value: track }))
        .forEach(({ key, value }) => {
        if (!uniqueAlbumsMap.has(key)) {
            uniqueAlbumsMap.set(key, { album: value.album, artist: value.artist });
        }
    });
    const uniqueAlbums = [...uniqueAlbumsMap.values()];
    const uniqueAlbumsInfo = [];
    for (const album of uniqueAlbums) {
        let albumSearchResults;
        try {
            albumSearchResults = await asyncSearchReleases(album.album, {
                artist: album.artist,
            });
        }
        catch (e) {
            console.error(e);
            continue;
        }
        albumSearchResults
            .sort((a, b) => {
            if (a.status === "Official") {
                return -1;
            }
            else {
                return 1;
            }
        })
            .sort((a, b) => {
            if (a.country === "XW") {
                return -1;
            }
            else {
                return 1;
            }
        });
        const [albumSearchResult] = albumSearchResults;
        if (!albumSearchResult) {
            console.warn(`No results for "${album.album} – ${album.artist}"`);
            continue;
        }
        const albumResult = await asyncLookupRelease(albumSearchResult.id, ["recordings"]);
        const [mediumResult] = albumResult.mediums;
        if (!mediumResult) {
            console.warn(`No results for "${album.album} – ${album.artist}"`);
            continue;
        }
        const tracks = mediumResult.tracks.map(track => ({
            name: track.name,
            duration: track.length
        }));
        uniqueAlbumsInfo.push({
            artist: album.artist,
            album: album.album,
            tracks
        });
        console.log("%d: got %s by %s, with %d tracks", uniqueAlbumsInfo.length, album.album, album.artist, tracks.length);
    }
    const data = JSON.stringify(uniqueAlbumsInfo, null, "\t");
    await asyncWriteFile(outFile, data);
};
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWxhc3RmbS1hbGJ1bS1pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dldC1sYXN0Zm0tYWxidW0taW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIseUJBQXlCO0FBQ3pCLGlDQUFpQztBQUNqQyw2QkFBNkI7QUFDN0IscUNBQXFDO0FBRXJDLDJDQUEyQztBQUMzQywrQkFBaUM7QUFFakMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxFQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBQyxHQUFHLElBQUksQ0FBQztBQUVwQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLDhCQUE4QixDQUFDLENBQUM7QUFvQm5ELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sU0FBUyxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUV4RyxJQUFJLEtBQUssR0FBdUIsRUFBRSxDQUFDO0FBRW5DLElBQUksQ0FBQztJQUNKLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMs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