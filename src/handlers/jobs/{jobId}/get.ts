import { getJobById } from '@database/job';
import { sendNotFoundError, sendGetResourceSuccess } from '@handlers/utils';
import type { Request, Response } from 'express';
import { JobByIdParams } from 'src/interfaces/http/jobs';


export const handleGetJobById = async (
  req: Request<JobByIdParams>,
  res: Response
) => {
  const { jobId } = req.params;

  const jobWithImageData = await getJobById(parseInt(jobId));

  if (jobWithImageData) {
    return sendGetResourceSuccess(res, jobWithImageData);
  } else {
    return sendNotFoundError(res, `Cannot find job with ID ${jobId}`);
  }
};
