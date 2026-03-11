const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const positions = await prisma.position.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("Positions:", positions);
}
main().catch(console.error).finally(() => prisma.$disconnect());
