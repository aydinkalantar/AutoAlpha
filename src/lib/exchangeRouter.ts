import ccxt from 'ccxt';

const CEX_EXCHANGES = ['BINANCE', 'BYBIT', 'OKX', 'MEXC', 'GATEIO', 'COINBASE', 'KRAKEN'];
const DEX_EXCHANGES = ['UNISWAP', 'HYPERLIQUID'];

export async function executeTrade(
    exchangeName: string,
    symbol: string,
    side: 'BUY' | 'SELL',
    amountUsd: number,
    marketType: 'SPOT' | 'FUTURES',
    apiKey: string,
    apiSecret: string,
    privateKey?: string,
    passphrase?: string,
    leverage?: number,
    isTestnet?: boolean,
    limitPrice?: number,
    stopLossPrice?: number,
    takeProfitPrice?: number,
    isExit?: boolean
) {
    if (CEX_EXCHANGES.includes(exchangeName)) {
        return await executeCexTrade(exchangeName, symbol, side, amountUsd, marketType, apiKey, apiSecret, passphrase, leverage, isTestnet, limitPrice, stopLossPrice, takeProfitPrice, isExit);
    } else {
        return await executeDexTrade(exchangeName, symbol, side, amountUsd, marketType, privateKey);
    }
}

async function executeCexTrade(
    exchangeName: string,
    symbol: string,
    side: 'BUY' | 'SELL',
    amountUsd: number,
    marketType: 'SPOT' | 'FUTURES',
    apiKey: string,
    apiSecret: string,
    passphrase?: string,
    leverage?: number,
    isTestnet?: boolean,
    limitPrice?: number,
    stopLossPrice?: number,
    takeProfitPrice?: number,
    isExit?: boolean
) {
    // 1. Initialize CCXT dynamically
    const ccxtClass = (ccxt as any)[exchangeName.toLowerCase()] || (ccxt as any)[exchangeName.toLowerCase().replace('io', '')];

    if (!ccxtClass) {
        throw new Error(`CCXT does not support ${exchangeName}`);
    }

    const exchangeConfig: Record<string, any> = {
        apiKey,
        secret: apiSecret,
        enableRateLimit: true,
        options: {
            defaultType: marketType === 'FUTURES' ? 'future' : 'spot',
        }
    };

    if (passphrase) exchangeConfig.password = passphrase;
    const exchange = new ccxtClass(exchangeConfig);

    if (isTestnet) {
        exchange.setSandboxMode(true);
    }

    // 2. Reject SHORT sides on SPOT
    if (marketType === 'SPOT' && side === 'SELL') {
        throw new Error('Cannot execute a SHORT (SELL entry) on a SPOT market.');
    }

    // 3. Margin Buffer (2% safety net on Virtual Balance)
    const safeUsdSize = amountUsd * 0.98;

    // 4. Fetch Markets for Limits & Tickers for price
    await exchange.loadMarkets();
    const market = exchange.market(symbol);


    // Fetch current price to calculate base asset amount
    const ticker = await exchange.fetchTicker(symbol);
    const currentPrice = ticker.last;

    let baseAssetAmount = isExit ? amountUsd : safeUsdSize / Number(currentPrice);

    // Futures Pre-Flight Configuration
    if (marketType === 'FUTURES') {
        // Step 1: Use exchange.setMarginMode('isolated') to protect user capital
        try {
            if (exchange.has['setMarginMode']) {
                await exchange.setMarginMode('isolated', symbol);
            }
        } catch (e: any) {
            console.warn(`[Margin Mode] Warning for ${symbol}: ${e.message}`);
        }

        // Steps 2 & 3: Fetch leverage and configure it on the exchange
        if (leverage) {
            try {
                if (exchange.has['setLeverage']) {
                    await exchange.setLeverage(leverage, symbol);
                }
            } catch (e: any) {
                console.warn(`[Leverage] Warning for ${symbol}: ${e.message}`);
            }
            // Step 4: Calculate leverage-scaled position size using the 2% safety buffer (Entries only)
            if (!isExit) {
                baseAssetAmount = baseAssetAmount * leverage;
            }
        }
    }

    // Ensure amount conforms to precision
    const safeAmount = exchange.amountToPrecision(symbol, baseAssetAmount);

    // 5. Dust Check Minimums
    const minCost = market.limits?.cost?.min || 0;
    if ((Number(safeAmount) * currentPrice) < minCost) {
        throw new Error(`Order size is below the minimum threshold for ${symbol}. Minimum is ${minCost}`);
    }

    // 6. Execute Trade (Dynamic Order Types)
    let orderType = 'market';
    let executionPrice = undefined;
    let params: Record<string, any> = {};

    if (limitPrice) {
        orderType = 'limit';
        executionPrice = limitPrice;
    }

    if (stopLossPrice) {
        params.stopLossPrice = stopLossPrice;
    }

    if (takeProfitPrice) {
        params.takeProfitPrice = takeProfitPrice;
    }

    // Use unified createOrder to support advanced params
    // Option parameters for advanced orders
    let orderParams = { ...params };
    if (isExit && marketType === 'FUTURES') {
        orderParams.reduceOnly = true;
    }

    // Protect against dusting errors
    if (!isExit && safeUsdSize < minCost) {
        throw new Error(`Order rejected: Calculated execution size ($${safeUsdSize.toFixed(2)}) is below the Exchange minimum notional limit ($${minCost}). Margin allocation too small.`);
    }

    const order = await exchange.createOrder(
        symbol,
        orderType,
        side.toLowerCase(),
        Number(safeAmount),
        executionPrice,
        orderParams
    );

    return order;
}

async function executeDexTrade(
    exchangeName: string,
    symbol: string,
    side: string,
    amountUsd: number,
    marketType: string,
    privateKey?: string
) {

    if (exchangeName === 'UNISWAP') {
        // Stub: Simulate successful DEX return
        return { filledAmount: amountUsd / 2000, orderId: `dex_stub_${Date.now()}` };
    }
    // Stub: Simulate successful SDK return
    return { filledAmount: amountUsd / 2000, orderId: `dex_stub_${Date.now()}` };
}
