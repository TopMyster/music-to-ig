require('dotenv').config();
const axios = require('axios');
const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');

const POLLING_INTERVAL = 60 * 1000;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

const ig = new IgApiClient();
let isInstagramLoggedIn = false;
let currentSong = null;

async function initInstagram() {
    try {
        ig.state.generateDevice(process.env.IG_USERNAME);
        
        if (fs.existsSync('session.json')) {
            const savedState = await fs.promises.readFile('session.json', 'utf8');
            await ig.state.deserialize(savedState);
            console.log("Loaded saved Instagram session.");
        } else {
            await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
            const serialized = await ig.state.serialize();
            delete serialized.constants;
            await fs.promises.writeFile('session.json', JSON.stringify(serialized));
            console.log("Successfully logged into Instagram and saved session.");
        }
        
        isInstagramLoggedIn = true;
    } catch (error) {
        console.error("Failed to log into Instagram. Please check your credentials.");
        console.error(error.message);
    }
}

async function getCurrentlyPlaying() {
    try {
        const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Music-IG-Bio-Updater/1.0' }
        });

        const track = response.data.recenttracks.track[0];

        if (track && track['@attr'] && track['@attr'].nowplaying === 'true') {
            const artist = track.artist['#text'];
            const title = track.name;
            return `${title} by ${artist}`;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch from Last.fm:", error.message);
        return null;
    }
}

async function updateInstagramBio(bioText) {
    if (!isInstagramLoggedIn) return;

    try {
        await ig.account.setBiography(bioText);
        console.log(`Updated Instagram bio: "${bioText}"`);
    } catch (error) {
        console.error("Failed to update Instagram bio:", error.message);
    }
}

async function pollLoop() {
    console.log("Checking for playing track...");
    const playing = await getCurrentlyPlaying();

    if (playing) {
        if (playing !== currentSong) {
            console.log(`New track detected: ${playing}`);
            currentSong = playing;

            const bioText = `Currently playing: ${playing}`;

            await updateInstagramBio(bioText);
        }
    } else {
        if (currentSong !== null) {
            console.log("Music stopped playing.");
            currentSong = null;

            const bioText = "Not currently playing anything.";

            await updateInstagramBio(bioText);
        }
    }
}

(async () => {
    console.log("Starting Bio Updater...");

    await initInstagram();

    await pollLoop();
    setInterval(pollLoop, POLLING_INTERVAL);
})();
