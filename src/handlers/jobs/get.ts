import { getJobs } from '@database/job';
import type { Request, Response } from 'express';
import { GetJobsQuery } from 'src/interfaces/http/jobs';


export const handleGetJobs = async (
  req: Request<any, null, null, GetJobsQuery>,
  res: Response
) => {
  const { page, limit } = req.query;

  const pageNumber = page ? parseInt(page) : undefined;
  const limitNumber = limit ? parseInt(limit) : undefined;

  const allJobs = await getJobs(pageNumber, limitNumber);
  const response = {
    results: allJobs,
    count: allJobs.length
  };

  res.send(response);
};
