const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const positions = await prisma.position.findMany({
    where: { isOpen: true },
    include: { subscription: { include: { strategy: true } } }
  });
  console.log(JSON.stringify(positions, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
