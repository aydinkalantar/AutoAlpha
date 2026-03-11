const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'kalantarbros@gmail.com' } });
  console.log('Result:', JSON.stringify(user));
}
main().catch(console.error).finally(() => prisma.$disconnect());
