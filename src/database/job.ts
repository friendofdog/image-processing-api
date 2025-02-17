import prisma from '@database/prisma';


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
  include: { images: true }
});
