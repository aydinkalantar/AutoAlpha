const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const strategyId = (await prisma.strategy.findFirst({ orderBy: { createdAt: 'desc' } })).id;
    console.log("Found Strategy:", strategyId);

    const allPositions = await prisma.position.findMany({
        where: { strategyId, isOpen: false },
        orderBy: { createdAt: 'asc' }
    });

    console.log("All Closed Positions:", allPositions.length);
    if (allPositions.length === 0) return console.log("Empty!");

    const totalTrades = allPositions.length;
    const winningTrades = allPositions.filter((p) => p.realizedPnl > 0).length;
    const winRatePercentage = (winningTrades / totalTrades) * 100;

    let cumulative = 10000;
    let peak = cumulative;
    let maxDrawdown = 0;

    for (const pos of allPositions) {
        cumulative += pos.realizedPnl;
        if (cumulative > peak) peak = cumulative;
        const drop = ((peak - cumulative) / peak) * 100;
        if (drop > maxDrawdown) maxDrawdown = drop;
    }

    console.log("Calculated WinRate:", winRatePercentage, "DD:", maxDrawdown);

    await prisma.strategy.update({
        where: { id: strategyId },
        data: {
            winRatePercentage,
            drawdownPercentage: maxDrawdown
        }
    });
    console.log("Prisma strategy updated!");

    const s = await prisma.strategy.findUnique({ where: { id: strategyId } });
    console.log("DB Value Now:", s.winRatePercentage, s.drawdownPercentage);

    process.exit(0);
}
run();
