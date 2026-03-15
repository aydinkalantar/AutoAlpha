const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Creating mock notifications...");
    await prisma.adminNotification.create({
        data: {
            type: "SUCCESS",
            message: "User ethantest@example.com deposited $500 to Gas Tank",
            link: "/admin/investors",
            isRead: false
        }
    });

    await prisma.adminNotification.create({
        data: {
            type: "WARNING",
            message: "User john.doe@example.com Binance API Disconnected",
            link: "/admin/investors",
            isRead: false
        }
    });

    await prisma.adminNotification.create({
        data: {
            type: "CRITICAL",
            message: "Webhook Signal Rejected: Invalid Auth Token",
            link: "/admin/logs",
            isRead: false
        }
    });
    console.log("Mock notifications created successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
