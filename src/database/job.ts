import prisma from '@database/prisma';
import { JobStatus } from '@prisma/client';


export const getJobs = async (
  page = 1,
  limit = 100
) => prisma.job.findMany({
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});

export const getJobById = async(
  jobId: number
) => prisma.job.findUnique({
  where: { id: jobId },
  include: { image: true }
});

export const getJobAndImageBySize = async (
  jobId: number
) => prisma.job.findFirst({
  where: {
    id: jobId,
    image: {}
  },
  include: {
    image: {
      select: { id: true, originalBlobId: true, thumbnailBlobId: true },
      where: { originalBlobId: { not: null }, thumbnailBlobId: { not: null } }
    }
  }
});

export const createNewJob = async () => prisma.job.create({
  data: {
    status: JobStatus.UNPROCESSED
  }
});

export const updateJob = async (
  jobId: number,
  updatedData: object
) => prisma.job.update({
  where: {
    id: jobId
  },
  data: {
    ...updatedData
  }
});
