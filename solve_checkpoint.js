require('dotenv').config();
const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const readline = require('readline');
const fs = require('fs');

const ig = new IgApiClient();

async function saveSession() {
    const serialized = await ig.state.serialize();
    delete serialized.constants;
    await fs.promises.writeFile('session.json', JSON.stringify(serialized));
    console.log("💾 Session saved to session.json.");
}

async function loginAndSolve() {
    ig.state.generateDevice(process.env.IG_USERNAME);
    
    // Override the app version to bypass the "unsupported_version" block
    ig.state.appVersion = '320.0.0.42.100';
    ig.state.appVersionCode = '555000000';
    Object.defineProperty(ig.state, 'appUserAgent', {
        get: () => `Instagram 320.0.0.42.100 Android (${ig.state.deviceString}; ${ig.state.language}; 555000000)`
    });

    try {
        console.log("Logging in...");
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        console.log("Attempting to trigger checkpoint by updating bio...");
        await ig.account.setBiography("Testing connection...");
        console.log("✅ Successfully updated bio! No checkpoint required.");
        await saveSession();
    } catch (e) {
        console.log("\n[DEBUG] Full error object:");
        console.dir(e.response ? e.response.body : e, { depth: null });

        if (e instanceof IgCheckpointError || (e.message && e.message.includes('checkpoint_required'))) {
            console.log("\n🚨 Checkpoint required! Instagram wants to verify it's you.");
            console.log("Requesting security code from Instagram (check your Email or SMS)...");

            try {
                await ig.challenge.auto(true); // Request code via SMS/Email

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.question("👉 Enter the 6-digit code: ", async (code) => {
                    rl.close();
                    try {
                        await ig.challenge.sendSecurityCode(code);
                        console.log("✅ Checkpoint solved successfully!");
                        await saveSession();
                    } catch (err) {
                        console.error("❌ Failed to verify code:", err.message);
                    }
                });
            } catch (challengeErr) {
                console.error("❌ Failed to request challenge code:", challengeErr.message);
                console.log("\n💡 WORKAROUND: Because the script couldn't get the challenge data from Instagram automatically, please try logging into Instagram from your phone's official app or instagram.com in an incognito window. You should see a prompt asking you to verify your login or activity. Once you verify it there, try running `node solve_checkpoint.js` again.");
            }
        } else {
            console.error("❌ Login failed:", e.message);
        }
    }
}

loginAndSolve();
