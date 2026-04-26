require('dotenv').config();
const axios = require('axios');
(async () => {
  try {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.LASTFM_USERNAME}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=1`;
    const response = await axios.get(url, { headers: { 'User-Agent': 'SoundCloud-IG-Bio-Updater/1.0' } });
    console.log("SUCCESS:", response.data);
  } catch (error) {
    console.log("ERROR:", error.message);
  }
})();
