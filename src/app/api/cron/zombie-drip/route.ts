import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/emails';
import ZombieReminderEmail from '../../../../../emails/ZombieReminderEmail';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const config = await prisma.systemConfig.findUnique({
            where: { id: 'global' }
        });

        if (!config?.zombieCampaignEnabled) {
            return NextResponse.json({ success: true, message: 'Campaign disabled' });
        }

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - config.zombieTriggerDays);

        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    lte: targetDate
                },
                exchangeKeys: {
                    none: {}
                },
                zombieEmailSentAt: null
            },
            take: 100 // Process in batches of 100
        });

        if (users.length === 0) {
            return NextResponse.json({ success: true, emailsSent: 0, message: 'No zombie users found' });
        }

        if (resend) {
            const batchEmails = users.map(user => ({
                from: 'AutoAlpha Team <notifications@autoalpha.trade>',
                to: user.email,
                subject: 'Need help setting up AutoAlpha? 🤖',
                react: ZombieReminderEmail({ userName: user.name || 'Investor' })
            }));

            const { data, error } = await resend.batch.send(batchEmails);

            if (error) {
                console.error('Error sending zombie drip emails:', error);
                return NextResponse.json({ success: false, error }, { status: 500 });
            }
        } else {
            console.log('Mock: Zombie Drip Emails would be sent to', users.length, 'users');
        }

        // Update sent status
        const userIds = users.map(u => u.id);
        await prisma.user.updateMany({
            where: {
                id: { in: userIds }
            },
            data: {
                zombieEmailSentAt: new Date()
            }
        });

        return NextResponse.json({ success: true, emailsSent: users.length });

    } catch (error: any) {
        console.error('Zombie drip cron failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
