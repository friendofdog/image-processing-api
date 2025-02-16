import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function unseed() {
  console.log('🗑️ Deleting seeded data...');

  await prisma.image.deleteMany({});
  await prisma.job.deleteMany({});

  console.log('✅ Seed data removed.');
}

unseed()
  .catch(error => {
    console.error('Error undoing seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
