async function testFetch() {
    try {
        const binanceSymbol = 'BTCUSDT';
        console.log("Fetching: " + `https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`);
        const res = await fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`);
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response Text:", text);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
testFetch();
