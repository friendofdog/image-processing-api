import prisma from '@database/prisma';
import type { Prisma } from '@prisma/client';
import { JobStatus } from '@prisma/client';


export const getJobs = async (
  page = 1,
  limit = 100
) => prisma.job.findMany({
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});

export const getJobById = async (
  jobId: number
) => prisma.job.findUnique({
  where: { id: jobId },
  include: { image: true }
});

export const getJobWithThumbnail = async (
  jobId: number
) => prisma.job.findFirst({
  where: {
    id: jobId,
    image: {}
  },
  include: {
    image: {
      select: { id: true, thumbnailBlobId: true },
      where: { thumbnailBlobId: { not: null } }
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
  updatedData: Prisma.JobUpdateInput
) => prisma.job.update({
  where: {
    id: jobId
  },
  data: {
    ...updatedData
  }
});
