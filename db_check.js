const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const strat = await prisma.strategy.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("Strategy:", strat.id, strat.winRatePercentage, strat.drawdownPercentage);
  const pos = await prisma.position.findMany({ where: { strategyId: strat.id, isOpen: false } });
  console.log("Closed Positions:", pos.length);
  process.exit(0);
}
run().catch(console.error);
