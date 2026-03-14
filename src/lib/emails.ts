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

export async function sendWelcomeBonusEmail(userEmail: string, bonusAmount: number) {
    if (!resend) {
        console.log("Mock Welcome Email Sent (No Resend API Key):", userEmail, bonusAmount);
        return { success: true, mock: true };
    }

    try {
        await resend.emails.send({
            from: 'AutoAlpha Team <notifications@autoalpha.trade>',
            to: userEmail,
            subject: 'We just funded your AutoAlpha Gas Tank! ⛽️',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #8b5cf6;">Welcome to AutoAlpha!</h2>
                    <p>To help you get started, we've credited your account with <strong>$${bonusAmount.toFixed(2)}</strong> in Gas Tank credits.</p>
                    
                    <p style="margin-top: 20px; line-height: 1.6;">
                        Because we are strictly non-custodial, we never touch your exchange funds. 
                        This credit covers your initial performance fees so you can test our algorithmic strategies completely risk-free.
                    </p>
                    
                    <p style="margin-top: 20px; font-weight: bold;">
                        Log in, connect your exchange API, and deploy your first strategy today!
                    </p>

                    <div style="margin-top: 30px;">
                        <a href="https://autoalpha.trade/dashboard" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send Welcome Bonus email:", error);
        return { success: false, error };
    }
}
