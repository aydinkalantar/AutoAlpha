const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = 'kalantarbros@gmail.com';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log(`User ${adminEmail} already exists. Upgrading to ADMIN.`);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      });
      console.log('Successfully upgraded user to Admin!');
    } else {
      console.log(`Creating new Admin profile for ${adminEmail}...`);
      await prisma.user.create({
        data: {
          email: adminEmail,
          role: 'ADMIN',
          isTestnetMode: true,
        }
      });
      console.log('Successfully created Admin profile!');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
