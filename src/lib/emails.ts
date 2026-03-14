import { Resend } from 'resend';

// Only initialize if the key exists so it doesn't crash builds if the user hasn't added it yet
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface TradeEmailData {
    userEmail: string;
    strategyName: string;
    side: 'BUY' | 'SELL';
    symbol: string;
    price: number | null;
    amount: number;
    exchange: string;
}

export async function sendTradeNotificationEmail(data: TradeEmailData) {
    if (!resend) {
        console.log("Mock Email Sent (No Resend API Key):", data);
        return { success: true, mock: true };
    }

    try {
        const action = data.side === 'BUY' ? 'opened a LONG' : 'closed a LONG / opened a SHORT';
        const priceStr = data.price ? `$${data.price.toFixed(4)}` : "Market Price";
        
        await resend.emails.send({
            from: 'AutoAlpha Trading <notifications@autoalpha.trade>',
            to: data.userEmail,
            subject: `Trade Alert: ${data.strategyName} executed on ${data.symbol}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: ${data.side === 'BUY' ? '#10b981' : '#f43f5e'};">Trade Executed</h2>
                    <p>Your subscription to <strong>${data.strategyName}</strong> just triggered a trade on <strong>${data.exchange}</strong>.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Action:</strong> ${data.side}</li>
                            <li><strong>Asset:</strong> ${data.symbol}</li>
                            <li><strong>Price:</strong> ${priceStr}</li>
                            <li><strong>Size:</strong> $${data.amount.toFixed(2)}</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 12px; color: #666; margin-top: 40px;">
                        To stop receiving these alerts, you can disable Trade Notifications in your <a href="https://autoalpha.ai/dashboard/account">Account Settings</a>.
                    </p>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send Resend email:", error);
        return { success: false, error };
    }
}
export async function sendWelcomeEmail(userEmail: string, hasBonus: boolean, bonusAmount: number = 0) {
    if (!resend) {
        console.log("Mock Welcome Email Sent (No Resend API Key):", userEmail, { hasBonus, bonusAmount });
        return { success: true, mock: true };
    }

    const subject = hasBonus 
        ? `Welcome to AutoAlpha! Claim your $${bonusAmount} Gas Tank credit ⛽️`
        : "Welcome to AutoAlpha 🚀";

    try {
        await resend.emails.send({
            from: 'AutoAlpha Team <notifications@autoalpha.trade>',
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #000000; color: #ffffff; text-align: left; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #333333;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                            AUTOALPHA
                        </h1>
                    </div>
                    
                    <h2 style="color: #a855f7; font-size: 24px; margin-top: 0;">Welcome to AutoAlpha!</h2>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-top: 20px;">
                        Welcome to the future of algorithmic trading. AutoAlpha gives you institutional-grade trading strategies without ever taking custody of your funds.
                    </p>
                    
                    ${hasBonus ? `
                    <div style="background-color: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e9d5ff;">
                            <strong style="color: #a855f7;">Special Bonus:</strong> To help you get started risk-free, we've credited your Gas Tank with <strong>$${bonusAmount.toFixed(2)}</strong> to cover your initial performance fees!
                        </p>
                    </div>
                    ` : ''}

                    <div style="margin: 30px 0;">
                        <h3 style="color: #ffffff; font-size: 18px; margin-bottom: 15px;">Next Steps</h3>
                        <ul style="list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                            <li style="display: flex; align-items: flex-start; gap: 12px;">
                                <span style="background-color: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">1</span>
                                <span style="color: #9ca3af; font-size: 16px; line-height: 1.5;"><strong>Connect your exchange API</strong> (Binance, Bybit, etc.)</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; gap: 12px;">
                                <span style="background-color: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">2</span>
                                <span style="color: #9ca3af; font-size: 16px; line-height: 1.5;"><strong>Browse the Strategy Marketplace.</strong></span>
                            </li>
                            <li style="display: flex; align-items: flex-start; gap: 12px;">
                                <span style="background-color: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">3</span>
                                <span style="color: #9ca3af; font-size: 16px; line-height: 1.5;"><strong>Allocate capital and deploy.</strong></span>
                            </li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 40px; text-align: center;">
                        <a href="https://autoalpha.trade/dashboard" style="background-color: #a855f7; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #6b7280; margin-top: 50px; text-align: center; border-top: 1px solid #333333; padding-top: 20px;">
                        You are receiving this because you registered at AutoAlpha.trade
                    </p>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send Welcome email:", error);
        return { success: false, error };
    }
}
