# music to ig bio

updates your instagram bio with whatever you're currently listening to. uses last.fm so it works with spotify, apple music, soundcloud, etc.

## setup

1. `npm install`
2. create a `.env` file with your details:
   ```env
   IG_USERNAME=your_username
   IG_PASSWORD=your_password
   LASTFM_USERNAME=your_lastfm
   LASTFM_API_KEY=your_api_key
   ```

## usage

if it's your first time or ig is blocking the login, run the checkpoint solver first:
`node solve_checkpoint.js` (it'll ask for the code sent to your email/sms).

then start the main script:
`node script.js`

it will check what you're playing every minute and update your bio. when you stop listening, it clears it to a "not playing anything" message.

*note: use a burner ig account if you care about getting banned.*

---
*code and docs generated with ai*
