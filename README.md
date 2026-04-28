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

**Step 1: Generate your session**
You **MUST** run the checkpoint solver first before starting the main script. This mimics a modern Instagram app version and generates a valid `session.json` file.
```bash
node solve_checkpoint.js
```
*(If Instagram requires verification, it will ask for a 6-digit code sent to your email/SMS. Once it says "Session saved", proceed to Step 2).*

**Step 2: Start the tracker**
```bash
node script.js
```

it will check what you're playing every minute and update your bio. when you stop listening, it clears it to a "not playing anything" message.

*note: use a burner ig account if you care about getting banned.*

---
*code and docs generated with ai*
