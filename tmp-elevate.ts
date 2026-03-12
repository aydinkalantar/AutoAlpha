import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = "kalantarbros@gmail.com";
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found. Here are current users:`);
    const users = await prisma.user.findMany({ select: { email: true, role: true }});
    console.log(users);
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN", isActive: true }
  });

  console.log(`Successfully elevated ${email} to ADMIN.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
