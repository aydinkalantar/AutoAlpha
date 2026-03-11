const MOCK_WEBHOOK_URL = 'http://localhost:3000/api/webhook/tradingview';
const MOCK_TOKEN = 'secret_webhook_token_123'; // Replace with the actual token generated in the DB
const SYMBOL = 'BTC/USDT';

async function sendWebhook(side) {
    try {
        const payload = {
            webhookToken: MOCK_TOKEN,
            symbol: SYMBOL,
            side: side
        };

        console.log(`\n[Test] Sending ${side} signal for ${SYMBOL}...`);

        const response = await fetch(MOCK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }); // <-- Added closing brace here

        const data = await response.json();

        if (response.ok) {
            console.log(`[Success] Webhook Response (${response.status}):`, data);
        } else {
            console.error(`[Error] Webhook Failed (${response.status}):`, data);
        }
    } catch (error) {
        console.error(`[Network Error] Could not reach webhook endpoint:`, error.message);
    }
}

async function runSimulation() {
    console.log('--- Starting Webhook Simulation ---');
    // Simulate an Entry
    await sendWebhook('LONG');

    // Wait a few seconds
    console.log('\n[Test] Waiting 5 seconds before closing position...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Simulate an Exit
    await sendWebhook('EXIT');
    console.log('\n--- Simulation Complete ---');
}

// Execute
runSimulation();
