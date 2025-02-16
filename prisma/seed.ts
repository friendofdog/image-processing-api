import { PrismaClient, JobStatus, ImageSize } from '@prisma/client';
import crypto from 'crypto';


const prisma = new PrismaClient();
const { UNPROCESSED, PROCESSING, SUCCEEDED, FAILED } = JobStatus;

async function main() {
  console.log('🌱 Seeding database...');
  let status: JobStatus;
  let createdAt = new Date();

  for (let i = 1; i <= 100; i++) {
    let blobIdOriginal: string | null = null;
    let blobIdThumbnail: string | null = null;

    switch (true) {
      case i % 20 === 0: // 5 entries
        status = FAILED;
        break;
      case i % 13 === 0: // 7 entries
        status = PROCESSING;
        blobIdOriginal = crypto.randomUUID();
        break;
      case i % 10 === 0: // 5 entries
        status = UNPROCESSED;
        break;
      default:
        status = SUCCEEDED;
        blobIdOriginal = crypto.randomUUID();
        blobIdThumbnail = crypto.randomUUID();
    }

    const job = await prisma.job.create({
      data: {
        createdAt,
        status
      }
    });

    await prisma.image.createMany({
      data: [
        {
          createdAt: new Date(createdAt.getTime() + 1 * 60 * 1000),
          jobId: job.id,
          blobId: blobIdOriginal,
          size: ImageSize.ORIGINAL
        },
        {
          createdAt: new Date(createdAt.getTime() + 2 * 60 * 1000),
          jobId: job.id,
          blobId: blobIdThumbnail,
          size: ImageSize.THUMBNAIL
        }
      ]
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
