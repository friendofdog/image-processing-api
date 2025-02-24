import prisma from '@database/prisma';
import type { Prisma } from '@prisma/client';


export const createNewImage = async (
  jobId: number,
  originalBlobId: string
) => prisma.image.create({
  data: {
    jobId,
    originalBlobId
  }
});

export const updateImageByJobId = async (
  jobId: number,
  updatedData: Prisma.ImageUpdateInput
) => prisma.image.update({
  where: {
    jobId
  },
  data: {
    ...updatedData
  }
});
