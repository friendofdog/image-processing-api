import prisma from '@database/prisma';


export const createNewImage = async (jobId: number, originalBlobId: string) => prisma.image.create({
  data: {
    jobId,
    originalBlobId
  }
});
