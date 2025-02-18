import { PrismaClient, JobStatus } from '@prisma/client';
import crypto from 'crypto';


const prisma = new PrismaClient();
const { UNPROCESSED, PROCESSING, SUCCEEDED, FAILED } = JobStatus;

async function main() {
  console.log('🌱 Seeding database...');
  let status: JobStatus;
  let createdAt = new Date();

  for (let i = 1; i <= 100; i++) {
    let originalBlobId: string | null = null;
    let thumbnailBlobId: string | null = null;

    switch (true) {
      case i % 20 === 0: // 5 entries
        status = FAILED;
        break;
      case i % 13 === 0: // 7 entries
        status = PROCESSING;
        originalBlobId = crypto.randomUUID();
        break;
      case i % 10 === 0: // 5 entries
        status = UNPROCESSED;
        break;
      default:
        status = SUCCEEDED;
        originalBlobId = crypto.randomUUID();
        thumbnailBlobId = crypto.randomUUID();
    }

    const job = await prisma.job.create({
      data: {
        createdAt,
        updatedAt: createdAt,
        status
      }
    });

    await prisma.image.create({
      data:{
        createdAt: new Date(createdAt.getTime() + 1 * 60 * 1000),
        updatedAt: new Date(createdAt.getTime() + 1 * 60 * 1000),
        jobId: job.id,
        originalBlobId,
        thumbnailBlobId
      }
    });

    createdAt = new Date(createdAt.getTime() + 60 * 60 * 1000);
    console.log(`✅ Created Job ${job.id} with images`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch(error => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
