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
