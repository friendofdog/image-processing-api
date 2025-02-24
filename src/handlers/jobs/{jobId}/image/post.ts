import { updateImage } from '@database/image';
import { updateJob } from '@database/job';
import { JobStatus } from '@prisma/client';
import type { Request, Response } from 'express';
import { JobByIdParams, PatchJobBody } from 'src/interfaces/http/jobs';


export const handlePostJobImage = async (
  req: Request<JobByIdParams, null, PatchJobBody>,
  res: Response
) => {
  const { jobId } = req.params;
  const { thumbnailBlobId, error } = req.body;

  if (error) {
    await updateJob(parseInt(jobId), { status: JobStatus.FAILED });
    await updateImage(parseInt(jobId), { thumbnailBlobId: null });

    console.error('An error occured while updating the thumbnail', error);
    
    res.status(500).send();
    return;
  }

  await updateJob(parseInt(jobId), { status: JobStatus.SUCCEEDED });
  await updateImage(parseInt(jobId), { thumbnailBlobId });

  res.status(200).send();
};
