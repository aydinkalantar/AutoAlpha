const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:NxzJOUcEpGDoCeuxdfhwjmwVazuofGoI@centerbeam.proxy.rlwy.net:48338/railway"
    }
  }
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'kalantarbros@gmail.com' },
    update: { role: 'ADMIN', isActive: true },
    create: { email: 'kalantarbros@gmail.com', role: 'ADMIN', isActive: true, passwordHash: 'OAUTH' }
  });
  console.log('Escalated:', user.email, 'Role:', user.role, 'Active:', user.isActive);
}
main().catch(console.error).finally(() => prisma.$disconnect());
