"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/workers/tradeWorker.ts
var import_bullmq = require("bullmq");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new import_client.PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// src/lib/exchangeRouter.ts
var import_ccxt = __toESM(require("ccxt"));
var CEX_EXCHANGES = ["BINANCE", "BYBIT", "OKX", "MEXC", "GATEIO", "COINBASE", "KRAKEN"];
async function executeTrade(exchangeName, symbol, side, amountUsd, marketType, apiKey, apiSecret, privateKey, passphrase, leverage, isTestnet, limitPrice, stopLossPrice, takeProfitPrice, isExit) {
  if (CEX_EXCHANGES.includes(exchangeName)) {
    return await executeCexTrade(exchangeName, symbol, side, amountUsd, marketType, apiKey, apiSecret, passphrase, leverage, isTestnet, limitPrice, stopLossPrice, takeProfitPrice, isExit);
  } else {
    return await executeDexTrade(exchangeName, symbol, side, amountUsd, marketType, privateKey);
  }
}
async function executeCexTrade(exchangeName, symbol, side, amountUsd, marketType, apiKey, apiSecret, passphrase, leverage, isTestnet, limitPrice, stopLossPrice, takeProfitPrice, isExit) {
  const ccxtClass = import_ccxt.default[exchangeName.toLowerCase()] || import_ccxt.default[exchangeName.toLowerCase().replace("io", "")];
  if (!ccxtClass) {
    throw new Error(`CCXT does not support ${exchangeName}`);
  }
  const exchangeConfig = {
    apiKey,
    secret: apiSecret,
    enableRateLimit: true,
    timeout: 3e4,
    options: {
      defaultType: marketType === "FUTURES" ? "future" : "spot"
    }
  };
  if (passphrase) exchangeConfig.password = passphrase;
  const exchange = new ccxtClass(exchangeConfig);
  if (isTestnet) {
    exchange.setSandboxMode(true);
  }
  if (marketType === "SPOT" && side === "SELL") {
    throw new Error("Cannot execute a SHORT (SELL entry) on a SPOT market.");
  }
  const safeUsdSize = amountUsd * 0.98;
  await exchange.loadMarkets();
  const market = exchange.market(symbol);
  const ticker = await exchange.fetchTicker(symbol);
  const currentPrice = ticker.last;
  let baseAssetAmount = isExit ? amountUsd : safeUsdSize / Number(currentPrice);
  if (marketType === "FUTURES") {
    try {
      if (exchange.has["setMarginMode"]) {
        await exchange.setMarginMode("isolated", symbol);
      }
    } catch (e) {
      console.warn(`[Margin Mode] Warning for ${symbol}: ${e.message}`);
    }
    if (leverage) {
      try {
        if (exchange.has["setLeverage"]) {
          await exchange.setLeverage(leverage, symbol);
        }
      } catch (e) {
        console.warn(`[Leverage] Warning for ${symbol}: ${e.message}`);
      }
      if (!isExit) {
        baseAssetAmount = baseAssetAmount * leverage;
      }
    }
  }
  const safeAmount = exchange.amountToPrecision(symbol, baseAssetAmount);
  const minCost = market.limits?.cost?.min || 0;
  if (Number(safeAmount) * currentPrice < minCost) {
    throw new Error(`Order size is below the minimum threshold for ${symbol}. Minimum is ${minCost}`);
  }
  let orderType = "market";
  let executionPrice = void 0;
  let params = {};
  if (limitPrice) {
    orderType = "limit";
    executionPrice = limitPrice;
  }
  if (stopLossPrice) {
    params.stopLossPrice = stopLossPrice;
  }
  if (takeProfitPrice) {
    params.takeProfitPrice = takeProfitPrice;
  }
  let orderParams = { ...params };
  if (isExit && marketType === "FUTURES") {
    orderParams.reduceOnly = true;
  }
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
async function executeDexTrade(exchangeName, symbol, side, amountUsd, marketType, privateKey) {
  if (exchangeName === "UNISWAP") {
    return { filledAmount: amountUsd / 2e3, orderId: `dex_stub_${Date.now()}` };
  }
  return { filledAmount: amountUsd / 2e3, orderId: `dex_stub_${Date.now()}` };
}

// src/lib/encryption.ts
var import_crypto = __toESM(require("crypto"));
var ALGORITHM = "aes-256-gcm";
var LEGACY_ALGORITHM = "aes-256-cbc";
function decryptKey(hash, secretKey) {
  const parts = hash.split(":");
  if (parts.length === 2) {
    const [legacyIvHex, legacyEncryptedText] = parts;
    const legacyIv = Buffer.from(legacyIvHex, "hex");
    const legacyKey = import_crypto.default.createHash("sha256").update(String(secretKey)).digest("base64").substring(0, 32);
    const legacyDecipher = import_crypto.default.createDecipheriv(LEGACY_ALGORITHM, Buffer.from(legacyKey), legacyIv);
    let legacyDecrypted = legacyDecipher.update(legacyEncryptedText, "hex", "utf8");
    legacyDecrypted += legacyDecipher.final("utf8");
    return legacyDecrypted;
  }
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format. Expected 'iv:authTag:encryptedText'.");
  }
  const [ivHex, authTagHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = import_crypto.default.createHash("sha256").update(String(secretKey)).digest("base64").substring(0, 32);
  const decipher = import_crypto.default.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// src/workers/tradeWorker.ts
async function updateStrategyMetrics(tx, strategyId) {
  const allPositions = await tx.position.findMany({
    where: { strategyId, isOpen: false },
    orderBy: { createdAt: "asc" }
  });
  if (allPositions.length === 0) return;
  const totalTrades = allPositions.length;
  const winningTrades = allPositions.filter((p) => p.realizedPnl > 0).length;
  const winRatePercentage = winningTrades / totalTrades * 100;
  let cumulative = 1e4;
  let peak = cumulative;
  let maxDrawdown = 0;
  for (const pos of allPositions) {
    cumulative += pos.realizedPnl;
    if (cumulative > peak) peak = cumulative;
    const drop = (peak - cumulative) / peak * 100;
    if (drop > maxDrawdown) maxDrawdown = drop;
  }
  await tx.strategy.update({
    where: { id: strategyId },
    data: {
      winRatePercentage,
      drawdownPercentage: maxDrawdown
    }
  });
}
async function handlePaperTrade(data, isExit, actionSide) {
  const {
    strategyId,
    subscriptionId,
    userId,
    symbol,
    positionId,
    filledAmount,
    performanceFeePercentage,
    exchange,
    marketType,
    settlementCurrency,
    virtualBalance,
    leverage
  } = data;
  let binanceSymbol = symbol.replace("/", "").toUpperCase();
  if (binanceSymbol.endsWith("USD") && !binanceSymbol.endsWith("USDT")) {
    binanceSymbol = binanceSymbol + "T";
  }
  let currentPrice = 0;
  try {
    const res = await fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`);
    const json = await res.json();
    if (json.price) {
      currentPrice = parseFloat(json.price);
    } else {
      throw new Error(`Invalid price response: ${JSON.stringify(json)}`);
    }
  } catch (e) {
    throw new Error(`Paper trading failed: could not fetch market price for ${symbol} - ${e.message}`);
  }
  if (isExit) {
    const orderPos = await prisma.position.findUnique({ where: { id: positionId } });
    if (!orderPos) throw new Error("Paper position not found for exit");
    const entryPrice = orderPos.entryPrice || currentPrice;
    const notional = orderPos.filledAmount * entryPrice;
    let grossPnl = 0;
    if (orderPos.side === "LONG" || orderPos.side === "BUY") {
      grossPnl = (currentPrice - entryPrice) * orderPos.filledAmount;
    } else {
      grossPnl = (entryPrice - currentPrice) * orderPos.filledAmount;
    }
    grossPnl = grossPnl * (orderPos.leverage || 1);
    const simFees = notional * 2e-3;
    const netPnl = grossPnl - simFees;
    await prisma.$transaction(async (tx) => {
      await tx.position.update({
        where: { id: positionId },
        data: { isOpen: false, realizedPnl: netPnl, exitPrice: currentPrice }
      });
      if (subscriptionId) {
        await tx.subscription.update({
          where: { id: subscriptionId },
          data: { currentVirtualBalance: { increment: netPnl } }
        });
      }
      if (netPnl > 0) {
        const sysConfig = await tx.systemConfig.findUnique({ where: { id: "global" } });
        const configRate = sysConfig?.affiliateCommissionRate || 0.1;
        const platformFeeRaw = netPnl * ((performanceFeePercentage || 30) / 100);
        const platformFee = Math.round(platformFeeRaw * 100) / 100;
        const updateField = settlementCurrency === "USDT" ? "paperUsdtBalance" : "paperUsdcBalance";
        const user = await tx.user.update({
          where: { id: userId },
          data: { [updateField]: { decrement: platformFee } },
          select: { referredById: true }
        });
        await tx.ledger.create({
          data: {
            userId,
            amount: -platformFee,
            currency: settlementCurrency,
            description: `[PAPER] Performance Fee Deducted for ${symbol} Trade`,
            type: "FEE_DEDUCTION",
            isPaper: true
          }
        });
        if (user.referredById) {
          const commissionRaw = platformFee * configRate;
          const commission = Math.round(commissionRaw * 100) / 100;
          if (commission > 0) {
            await tx.user.update({
              where: { id: user.referredById },
              data: {
                [updateField]: { increment: commission },
                affiliateBalance: { increment: commission },
                totalAffiliateEarnings: { increment: commission }
              }
            });
            await tx.ledger.create({
              data: {
                userId: user.referredById,
                amount: commission,
                currency: settlementCurrency,
                description: `[PAPER] Affiliate Commission from network trade`,
                type: "AFFILIATE_COMMISSION",
                isPaper: true
              }
            });
          }
        }
      }
      await tx.notification.create({
        data: {
          userId,
          title: "Paper Trade Closed",
          message: `Closed simulated ${symbol} position. Net PnL: $${netPnl.toFixed(2)}`,
          type: "TRADE"
        }
      });
      await updateStrategyMetrics(tx, strategyId);
    });
  } else {
    const _leverage = leverage || 1;
    const totalNotionalExposure = virtualBalance * _leverage;
    const amountOfCoins = totalNotionalExposure / currentPrice;
    await prisma.$transaction(async (tx) => {
      await tx.position.create({
        data: {
          userId,
          strategyId,
          subscriptionId,
          symbol,
          side: actionSide,
          requestedAmount: totalNotionalExposure,
          filledAmount: amountOfCoins,
          entryPrice: currentPrice,
          leverage: leverage || 1,
          exchangeOrderId: data.orderId || `PAPER_SIM_${Date.now()}`,
          tvPrice: data.tvPrice,
          slippage: data.tvPrice && currentPrice ? (currentPrice - data.tvPrice) / data.tvPrice * 100 : null,
          isOpen: true,
          isPaper: true
        }
      });
      await tx.notification.create({
        data: {
          userId,
          title: "Paper Trade Opened",
          message: `Opened simulated ${actionSide} position on ${symbol} at $${currentPrice}.`,
          type: "TRADE"
        }
      });
    });
  }
}
var worker = new import_bullmq.Worker("qa-test-queue", async (job) => {
  const {
    strategyId,
    subscriptionId,
    userId,
    symbol,
    side,
    // For entry
    closeSide,
    // For exit
    positionId,
    // For exit
    filledAmount,
    // For exit
    performanceFeePercentage,
    // For exit
    exchange,
    marketType,
    settlementCurrency,
    virtualBalance,
    leverage,
    isTestnet,
    orderId,
    // Extract the TV string from the payload
    tvPrice
    // Extract the webhook price for slippage
  } = job.data;
  try {
    const isExit = job.name === "exit-trade";
    const actionSide = isExit ? closeSide : side;
    const isPaperTrade = job.data.isPaper === true || String(job.data.isPaper) === "true";
    if (isPaperTrade) {
      await handlePaperTrade(job.data, isExit, actionSide);
      return;
    }
    const exchangeKey = await prisma.exchangeKey.findFirst({
      where: { userId, exchange, isTestnet }
    });
    if (!exchangeKey) {
      throw new Error(`No API key found for user ${userId} on exchange ${exchange}`);
    }
    const {
      encryptedApiKey,
      encryptedSecret,
      encryptedPrivateKey,
      exchangePassphrase,
      iv
    } = exchangeKey;
    let apiKey = "";
    let apiSecret = "";
    let privateKey = void 0;
    const secretKey = process.env.MASTER_ENCRYPTION_KEY;
    if (!secretKey) throw new Error("MASTER_ENCRYPTION_KEY is missing from environment variables.");
    if (encryptedApiKey && encryptedSecret) {
      apiKey = decryptKey(encryptedApiKey, secretKey);
      apiSecret = decryptKey(encryptedSecret, secretKey);
      if (encryptedPrivateKey) {
        privateKey = decryptKey(encryptedPrivateKey, secretKey);
      }
    } else {
      throw new Error("Exchange key missing encrypted payload");
    }
    if (isExit) {
      const orderPos = await prisma.position.findUnique({
        where: { id: positionId }
      });
      await executeTrade(
        exchange,
        symbol,
        actionSide,
        // We pass the reversed side
        filledAmount,
        // We want to sell exactly what we hold
        marketType,
        apiKey,
        apiSecret,
        privateKey,
        // RE-ADD DELETED PARAMETER
        exchangePassphrase || void 0,
        void 0,
        // leverage
        isTestnet,
        // Ensure testnet logic runs
        void 0,
        void 0,
        void 0,
        true
        // isExit flag
      );
      let netPnl = 0;
      let grossPnl = 0;
      let exitPrice = 0;
      const simulatedReturnPercent = Math.random() * 0.15 - 0.05;
      if (orderPos) {
        const entryPrice = orderPos.entryPrice || 0;
        if (orderPos.side === "LONG" || orderPos.side === "BUY") {
          exitPrice = entryPrice * (1 + simulatedReturnPercent);
        } else {
          exitPrice = entryPrice * (1 - simulatedReturnPercent);
        }
        const notional = orderPos.filledAmount * entryPrice;
        grossPnl = notional * simulatedReturnPercent;
        const simFees = notional * 1e-3 * 2;
        netPnl = grossPnl - simFees;
      }
      await prisma.$transaction(async (tx) => {
        await tx.position.update({
          where: { id: positionId },
          data: { isOpen: false, realizedPnl: netPnl, exitPrice }
        });
        if (subscriptionId) {
          await tx.subscription.update({
            where: { id: subscriptionId },
            data: { currentVirtualBalance: { increment: netPnl } }
          });
        }
        if (netPnl > 0) {
          const sysConfig = await tx.systemConfig.findUnique({ where: { id: "global" } });
          const configRate = sysConfig?.affiliateCommissionRate || 0.1;
          const platformFeeRaw = netPnl * (performanceFeePercentage / 100);
          const platformFee = Math.round(platformFeeRaw * 100) / 100;
          let user;
          if (settlementCurrency === "USDT") {
            user = await tx.user.update({
              where: { id: userId },
              data: { usdtBalance: { decrement: platformFee } },
              select: { referredById: true }
            });
          } else {
            user = await tx.user.update({
              where: { id: userId },
              data: { usdcBalance: { decrement: platformFee } },
              select: { referredById: true }
            });
          }
          await tx.ledger.create({
            data: {
              userId,
              amount: -platformFee,
              currency: settlementCurrency,
              description: `Performance Fee Deducted for ${symbol} Trade`,
              type: "FEE_DEDUCTION"
            }
          });
          if (user.referredById) {
            const commissionRaw = platformFee * configRate;
            const commission = Math.round(commissionRaw * 100) / 100;
            const updateField = settlementCurrency === "USDT" ? "usdtBalance" : "usdcBalance";
            if (commission > 0) {
              await tx.user.update({
                where: { id: user.referredById },
                data: {
                  [updateField]: { increment: commission },
                  affiliateBalance: { increment: commission },
                  totalAffiliateEarnings: { increment: commission }
                }
              });
              await tx.ledger.create({
                data: {
                  userId: user.referredById,
                  amount: commission,
                  currency: settlementCurrency,
                  description: `Affiliate Commission from network trade`,
                  type: "AFFILIATE_COMMISSION"
                }
              });
            }
          }
        }
        await tx.notification.create({
          data: {
            userId,
            title: "Trade Closed",
            message: `Closed ${symbol} position. Net PnL: $${netPnl.toFixed(2)}`,
            type: "TRADE"
          }
        });
        await updateStrategyMetrics(tx, strategyId);
      });
    } else {
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { usdtBalance: true, usdcBalance: true }
      });
      if (!userRecord || userRecord.usdtBalance <= 0 && userRecord.usdcBalance <= 0) {
        console.warn(`[Shield] Bypassing entry trade for User ${userId}. Negative or zero Gas Tank.`);
        return;
      }
      const _leverage = leverage || 1;
      const totalNotionalExposure = virtualBalance * _leverage;
      const order = await executeTrade(
        exchange,
        symbol,
        actionSide,
        totalNotionalExposure,
        // Pass the mathematically leveraged absolute exposure
        marketType,
        apiKey,
        apiSecret,
        privateKey,
        exchangePassphrase || void 0,
        leverage,
        isTestnet
        // Ensure testnet logic runs
      );
      if (order) {
        await prisma.$transaction(async (tx) => {
          await tx.position.create({
            data: {
              userId,
              strategyId,
              subscriptionId,
              symbol,
              side: actionSide,
              requestedAmount: totalNotionalExposure,
              filledAmount: Number(order?.amount || 0),
              entryPrice: Number(order?.average || order?.price || 0),
              exchangeOrderId: orderId || order?.id || "stub_id",
              tvPrice,
              slippage: tvPrice && (order?.average || order?.price) ? (Number(order?.average || order?.price) - tvPrice) / tvPrice * 100 : null,
              isOpen: true
            }
          });
          await tx.notification.create({
            data: {
              userId,
              title: "Trade Opened",
              message: `Opened ${actionSide} position on ${symbol}.`,
              type: "TRADE"
            }
          });
        });
      }
    }
  } catch (error) {
    console.error(`[Worker] Failed task ${job.name}`, error);
    if (job.name === "exit-trade" && error?.message?.match(/insufficient|reduce|balance|not found|margin|position|dust|signature|api|key|credential|precision/i)) {
      const { positionId: positionId2, strategyId: strategyId2, userId: userId2, symbol: symbol2 } = job.data;
      if (positionId2) {
        await prisma.$transaction(async (tx) => {
          await tx.position.update({
            where: { id: positionId2 },
            data: { isOpen: false, exitPrice: 0, realizedPnl: 0 }
          });
          await tx.notification.create({
            data: {
              userId: userId2,
              title: "Trade Force-Closed (Desync)",
              message: `Local ${symbol2} position closed following exchange desync.`,
              type: "SYSTEM"
            }
          });
          await updateStrategyMetrics(tx, strategyId2);
        });
        return;
      }
    }
    throw error;
  }
}, {
  connection: process.env.REDIS_URL ? new (require("ioredis"))(process.env.REDIS_URL, { maxRetriesPerRequest: null, family: 0 }) : {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379")
  }
});
worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error ${err.message}`);
});
console.info("[Worker] BullMQ Trade Execution Worker started...");
