const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const position = await prisma.position.findUnique({
    where: { id: "cmml662y9000ljh071wkxp8xp" }
  });
  console.log("Position:", position);
}
main().catch(console.error).finally(() => prisma.$disconnect());
