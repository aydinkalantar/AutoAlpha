const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const positions = await prisma.position.count({ where: { isOpen: true } });
  console.log('Open positions:', positions);
}
main().catch(console.error).finally(() => prisma.$disconnect());
