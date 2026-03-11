const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://postgres:NxzJOUcEpGDoCeuxdfhwjmwVazuofGoI@centerbeam.proxy.rlwy.net:48338/railway' }
  }
});

console.log('[DAEMON] Listening for kalantarbros@gmail.com OAuth creation...');

setInterval(async () => {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'kalantarbros@gmail.com' } });
        if (user && (!user.isActive || user.role !== 'ADMIN')) {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN', isActive: true }
            });
            console.log('\n\n✅ [DAEMON] INSTANTLY UPGRADED kalantarbros@gmail.com TO MASTER ADMIN!\n\n');
            process.exit(0);
        }
    } catch(e) {
        // Ignore silent timeout errors
    }
}, 2000);
