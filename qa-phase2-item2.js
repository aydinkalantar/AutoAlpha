const { executeTrade } = require('./src/lib/exchangeRouter');

async function main() {
    console.log("Setting up controlled Phase 2 Test Environment for Live Execution...");
    console.log("Testing Target 1: CCXT Order Type Formatting");
    console.log("Testing Target 2: API Rejection Handling (Invalid Keys)");

    try {
        console.log("\nDispatching Mock Live Trade to CCXT Router...");
        const result = await executeTrade(
            'BYBIT',        // exchangeId
            'BTC/USDT',       // symbol
            100,              // absolute exposed dollar amount
            'FUTURES',        // marketType
            'FAKE_API_KEY_1234567890',  // Invalid API key
            'FAKE_API_SECRET_0987654321', // Invalid Secret
            undefined,        // privateKey
            undefined,        // exchangePassphrase
            3,                // leverage
            true,             // isTestnet
            60000,            // Limit Price (Test!)
            59000             // Stop Loss (Test!)
        );

        console.log("\n[WARNING] Trade Succeeded? This should not happen with fake keys.");
        console.log(result);

    } catch (error) {
        console.log("\n===== QA PHASE 2: EXECUTION RESULT =====");
        console.log("Rejection Caught Successfully!");
        console.log("Error Message:", error.message);

        // Log the exact constructor/exchange failure to prove CCXT handled it gracefully
        if (error.constructor.name) {
            console.log("Error Type:", error.constructor.name);
        }
        console.log("========================================");
    }
}

main().catch(console.error);
