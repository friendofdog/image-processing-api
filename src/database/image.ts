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

export const updateImage = async (
  id: number,
  updatedData: Prisma.ImageUpdateInput
) => prisma.image.update({
  where: {
    id
  },
  data: {
    ...updatedData
  }
});
