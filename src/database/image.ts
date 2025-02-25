import prisma from '@database/prisma';
import type { Prisma } from '@prisma/client';


export const createNewImage = async (
  jobId: number
) => prisma.image.create({
  data: {
    jobId
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
