require('dotenv').config();
const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const readline = require('readline');

const ig = new IgApiClient();

async function loginAndSolve() {
    ig.state.generateDevice(process.env.IG_USERNAME);
    
    try {
        console.log("Logging in...");
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        console.log("Attempting to trigger checkpoint by updating bio...");
        await ig.account.setBiography("Testing connection...");
        console.log("✅ Successfully updated bio! No checkpoint required.");
    } catch (e) {
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
                    } catch (err) {
                        console.error("❌ Failed to verify code:", err.message);
                    }
                });
            } catch (challengeErr) {
                console.error("❌ Failed to request challenge code:", challengeErr.message);
            }
        } else {
            console.error("❌ Login failed:", e.message);
        }
    }
}

loginAndSolve();
