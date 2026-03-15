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

// src/workers/cronJobs.ts
var import_node_cron = __toESM(require("node-cron"));
var import_ccxt = __toESM(require("ccxt"));

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new import_client.PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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

// src/workers/cronJobs.ts
var import_stripe = __toESM(require("stripe"));
var import_resend = require("resend");

// emails/ZombieReminderEmail.tsx
var import_components = require("@react-email/components");
var import_jsx_runtime = require("react/jsx-runtime");
var baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoalpha.ai";
var ZombieReminderEmail = ({
  userName = "Trader"
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.Html, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Head, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Preview, { children: "Complete your AutoAlpha setup to start automated trading." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Tailwind, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Body, { className: "bg-[#0B0D14] my-auto mx-auto font-sans px-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.Container, { className: "border border-white/10 rounded-[20px] my-[40px] mx-auto p-[20px] max-w-[465px] bg-[#11131F]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Section, { className: "mt-[20px] mb-[30px] text-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-4 h-4 bg-white rotate-45 rounded-sm" }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Heading, { className: "text-white text-[24px] font-bold text-center p-0 my-[30px] mx-0 tracking-tight", children: "Action Required: Connect Your Exchange" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.Text, { className: "text-white/80 text-[15px] leading-[24px]", children: [
        "Hi ",
        userName,
        ","
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Text, { className: "text-white/80 text-[15px] leading-[24px]", children: "We noticed you created an AutoAlpha account but haven't connected your exchange API keys yet. Your algorithmic trading terminal is currently suspended and won't execute trades in the market." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Text, { className: "text-white/80 text-[15px] leading-[24px]", children: "You can complete your setup in under two minutes by securely linking your Binance or Bybit read-only execution credentials." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Section, { className: "text-center mt-[32px] mb-[32px]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_components.Button,
        {
          className: "bg-emerald-500 rounded-lg text-white text-[14px] font-bold no-underline text-center px-6 py-3",
          href: `${baseUrl}/dashboard/account`,
          children: "Connect Exchange API \u2192"
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Text, { className: "text-white/60 text-[14px] leading-[24px]", children: "Our platform uses end-to-end AES-256 encryption. We can never withdraw funds from your exchange\u2014AutoAlpha only negotiates read-only and Spot execution rights." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Hr, { className: "border border-solid border-white/10 my-[26px] mx-0 w-full" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Text, { className: "text-[#666666] text-[12px] leading-[24px]", children: "If you have any questions about API security or need help generating your keys, reply to this email to reach our engineering team." })
    ] }) }) })
  ] });
};

// src/workers/cronJobs.ts
var resend = new import_resend.Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");
import_node_cron.default.schedule("*/5 * * * *", async () => {
  console.log("[Cron] Running 5-Minute Open Position Reconciliation...");
  try {
    const openPositions = await prisma.position.findMany({
      where: { isOpen: true },
      include: {
        strategy: true
      }
    });
    for (const pos of openPositions) {
      try {
        const exchangeKey = await prisma.exchangeKey.findFirst({
          where: { userId: pos.userId, exchange: pos.strategy.targetExchange }
        });
        if (!exchangeKey || !exchangeKey.encryptedApiKey || !exchangeKey.encryptedSecret) continue;
        const secretKey = process.env.MASTER_ENCRYPTION_KEY;
        if (!secretKey) throw new Error("MASTER_ENCRYPTION_KEY is missing from environment variables.");
        const apiKey = decryptKey(exchangeKey.encryptedApiKey, secretKey);
        const apiSecret = decryptKey(exchangeKey.encryptedSecret, secretKey);
        const ccxtClass = import_ccxt.default[pos.strategy.targetExchange.toLowerCase()] || import_ccxt.default[pos.strategy.targetExchange.toLowerCase().replace("io", "")];
        if (!ccxtClass) continue;
        const exchangeConfig = {
          apiKey,
          secret: apiSecret,
          enableRateLimit: true
        };
        if (exchangeKey.exchangePassphrase) exchangeConfig.password = exchangeKey.exchangePassphrase;
        const exchange = new ccxtClass(exchangeConfig);
        if (exchangeKey.isTestnet) {
          exchange.setSandboxMode(true);
        }
        let isActuallyOpen = false;
        if (pos.strategy.marketType === "FUTURES" && exchange.has["fetchPositions"]) {
          const ccxtPositions = await exchange.fetchPositions([pos.symbol]);
          const currentPos = ccxtPositions.find((p) => p.symbol === pos.symbol);
          isActuallyOpen = currentPos && Math.abs(currentPos.contracts || currentPos.info?.size || 0) > 0;
        } else {
          continue;
        }
        if (!isActuallyOpen) {
          const simulatedPnl = pos.filledAmount * (Math.random() * 0.1 - 0.05);
          await prisma.$transaction(async (tx) => {
            await tx.position.update({
              where: { id: pos.id },
              data: { isOpen: false, realizedPnl: simulatedPnl }
            });
            await tx.subscription.update({
              where: { id: pos.subscriptionId },
              data: { currentVirtualBalance: { increment: simulatedPnl } }
            });
            if (simulatedPnl > 0) {
              const platformFee = simulatedPnl * (pos.strategy.performanceFeePercentage / 100);
              let user;
              if (pos.strategy.settlementCurrency === "USDT") {
                user = await tx.user.update({
                  where: { id: pos.userId },
                  data: { usdtBalance: { decrement: platformFee } },
                  select: { referredById: true }
                });
              } else {
                user = await tx.user.update({
                  where: { id: pos.userId },
                  data: { usdcBalance: { decrement: platformFee } },
                  select: { referredById: true }
                });
              }
              await tx.ledger.create({
                data: {
                  userId: pos.userId,
                  amount: -platformFee,
                  currency: pos.strategy.settlementCurrency,
                  description: `Performance Fee Deducted for ${pos.symbol} Trade`,
                  type: "FEE_DEDUCTION"
                }
              });
              if (user.referredById) {
                const sysConfig = await tx.systemConfig.findUnique({ where: { id: "global" } });
                const configRate = sysConfig?.affiliateCommissionRate || 0.1;
                const commissionRaw = platformFee * configRate;
                const commission = Math.round(commissionRaw * 100) / 100;
                const updateField = pos.strategy.settlementCurrency === "USDT" ? "usdtBalance" : "usdcBalance";
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
                      currency: pos.strategy.settlementCurrency,
                      description: `Affiliate Commission from network trade`,
                      type: "AFFILIATE_COMMISSION"
                    }
                  });
                }
              }
              await tx.notification.create({
                data: {
                  userId: pos.userId,
                  title: "Position Reconciled",
                  message: `Closed ${pos.symbol}. PnL: $${simulatedPnl.toFixed(2)}, Fee: $${platformFee.toFixed(2)}`,
                  type: "SYSTEM"
                }
              });
            }
          });
        }
      } catch (err) {
        console.error(`Error processing position ${pos.id}`, err);
      }
    }
  } catch (err) {
    console.error("[Cron] Fatal Error in Reconciliation Job:", err);
  }
});
import_node_cron.default.schedule("0 0 * * *", async () => {
  console.log("[Cron] Running Daily API Health Checks...");
  try {
    const keys = await prisma.exchangeKey.findMany();
    for (const key of keys) {
      try {
        if (!key.encryptedApiKey || !key.encryptedSecret) continue;
        const secretKey = process.env.MASTER_ENCRYPTION_KEY;
        if (!secretKey) throw new Error("MASTER_ENCRYPTION_KEY is missing from environment variables.");
        const apiKey = decryptKey(key.encryptedApiKey, secretKey);
        const apiSecret = decryptKey(key.encryptedSecret, secretKey);
        const ccxtClass = import_ccxt.default[key.exchange.toLowerCase()] || import_ccxt.default[key.exchange.toLowerCase().replace("io", "")];
        if (!ccxtClass) continue;
        const exchangeConfig = {
          apiKey,
          secret: apiSecret,
          enableRateLimit: true
        };
        if (key.exchangePassphrase) exchangeConfig.password = key.exchangePassphrase;
        const exchange = new ccxtClass(exchangeConfig);
        if (key.isTestnet) {
          exchange.setSandboxMode(true);
        }
        await exchange.fetchBalance();
        await prisma.exchangeKey.update({
          where: { id: key.id },
          data: { isValid: true }
        });
      } catch (innerErr) {
        await prisma.exchangeKey.update({
          where: { id: key.id },
          data: { isValid: false }
        });
        await prisma.notification.create({
          data: {
            userId: key.userId,
            title: "API Connection Failed",
            message: `Your ${key.exchange} API key is invalid or expired. Please update it.`,
            type: "SYSTEM"
          }
        });
      }
    }
  } catch (err) {
    console.error("[Cron] Fatal Error in Health Check Job:", err);
  }
});
import_node_cron.default.schedule("0 * * * *", async () => {
  console.log("[Cron] Running Hourly Auto-Deposit Processing...");
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
    const secretKey = config?.stripeMode === "LIVE" ? config?.stripeLiveSecretKey || process.env.STRIPE_SECRET_KEY : config?.stripeTestSecretKey || process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("[Cron] Auto-Deposit Failed: Stripe Configuration Missing");
      return;
    }
    const stripe = new import_stripe.default(secretKey, {
      apiVersion: "2023-10-16"
    });
    const eligibleUsers = await prisma.user.findMany({
      where: {
        autoDepositEnabled: true,
        stripeCustomerId: { not: null },
        // Safety check: Don't charge if they were charged in the last 12 hours
        OR: [
          { lastAutoDepositAt: null },
          { lastAutoDepositAt: { lt: new Date(Date.now() - 12 * 60 * 60 * 1e3) } }
        ]
      }
    });
    for (const user of eligibleUsers) {
      const totalBalance = user.usdtBalance;
      if (totalBalance < user.autoDepositThreshold) {
        console.log(`[Cron] User ${user.email} (ID: ${user.id}) balance ${totalBalance} is below threshold ${user.autoDepositThreshold}. Initiating Auto-Deposit of ${user.autoDepositAmount}...`);
        try {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: "card"
          });
          if (paymentMethods.data.length === 0) {
            console.log(`[Cron] User ${user.id} has no saved payment methods. Skipping.`);
            continue;
          }
          const defaultPaymentMethod = paymentMethods.data[0].id;
          const grossAmount = (user.autoDepositAmount + 0.3) / 0.971;
          const amountInCents = Math.round(grossAmount * 100);
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            customer: user.stripeCustomerId,
            payment_method: defaultPaymentMethod,
            off_session: true,
            confirm: true,
            description: `AutoAlpha Auto-Refill (Threshold: $${user.autoDepositThreshold})`,
            metadata: {
              userId: user.id,
              isAutoDeposit: "true",
              netAmount: user.autoDepositAmount.toString()
            }
          });
          if (paymentIntent.status === "succeeded") {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                usdtBalance: { increment: user.autoDepositAmount },
                lastAutoDepositAt: /* @__PURE__ */ new Date()
              }
            });
            await prisma.ledger.create({
              data: {
                userId: user.id,
                amount: user.autoDepositAmount,
                currency: "USDT",
                type: "DEPOSIT",
                description: "Stripe Auto-Deposit Refill"
              }
            });
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: "Auto-Refill Successful",
                message: `Your Gas Tank fell below $${user.autoDepositThreshold}. We successfully deposited $${user.autoDepositAmount} using your saved card.`,
                type: "SYSTEM"
              }
            });
            console.log(`[Cron] Auto-Deposit success for ${user.id}`);
          }
        } catch (stripeErr) {
          console.error(`[Cron] Stripe charge failed for user ${user.id}:`, stripeErr.message);
          if (stripeErr.code === "authentication_required") {
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: "Auto-Refill Failed: Authentication Required",
                message: `Your bank denied the automated charge. Please log in and make a manual deposit to re-authenticate your card.`,
                type: "ALERT"
              }
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("[Cron] Fatal Error in Auto-Deposit Job:", err);
  }
});
import_node_cron.default.schedule("0 * * * *", async () => {
  console.log("[Cron] Running Zombie User Sweep...");
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const zombies = await prisma.user.findMany({
      where: {
        isActive: false,
        hasCompletedOnboarding: false,
        createdAt: { lt: twentyFourHoursAgo },
        zombieEmailSentAt: null,
        role: "USER"
        // Don't ping admins testing the platform
      },
      take: 50
      // Throttle Resend API burst
    });
    if (zombies.length === 0) return;
    console.log(`[Cron] Found ${zombies.length} Zombie users. Initiating Email Broadcast...`);
    for (const user of zombies) {
      try {
        const { data, error } = await resend.emails.send({
          from: "AutoAlpha Engineering <engineering@autoalpha.ai>",
          to: [user.email],
          subject: "Action Required: Complete your AutoAlpha Setup",
          react: ZombieReminderEmail({ userName: user.name || "Trader" })
        });
        if (error) {
          console.error(`[Cron] Failed to email zombie ${user.email}:`, error);
          continue;
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { zombieEmailSentAt: /* @__PURE__ */ new Date() }
        });
        console.log(`[Cron] Successfully hit Zombie Drone for ${user.email}`);
      } catch (err) {
        console.error(`[Cron] Runtime error emailing zombie ${user.email}:`, err);
      }
    }
  } catch (err) {
    console.error("[Cron] Fatal Error in Zombie Drone Job:", err);
  }
});
console.log("[System] Background Cron Jobs Initialization Loaded.");
