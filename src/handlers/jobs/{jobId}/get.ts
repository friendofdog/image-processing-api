import { getJobById } from '@database/job';
import type { Request, Response } from 'express';
import { GetJobByIdParams } from 'src/interfaces/http/jobs';


export const handleGetJobById = async (
  req: Request<GetJobByIdParams>,
  res: Response
) => {
  const { jobId } = req.params;

  const jobWithImages = await getJobById(parseInt(jobId));

  if (jobWithImages) {
    res.send(jobWithImages);
  } else {
    res.status(404).send(`Cannot find job with ID ${jobId}`);
  }
};
