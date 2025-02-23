import { createNewJob, updateJob } from '@database/job';
import { createNewImage } from '@database/image';
import type { Request, Response } from 'express';
import { uploadFile } from '@services/imageStorage';
import { randomUUID } from 'crypto';
import { JobStatus } from '@prisma/client';
import { PostJobBody } from '@interfaces/http/jobs';


export const handleCreateJob = async (
  req: Request<any, null, PostJobBody>,
  res: Response
): Promise<void> => {
  if (!req?.file) {
    res.status(400).send('File to upload is missing or incomplete.');
    return;
  }

  const { originalname, buffer, mimetype } = req.file;
  const newJob = await createNewJob();
  const { id: jobId } = newJob;
  const blobId = randomUUID();

  await uploadFile(blobId, originalname, buffer, mimetype)
    .catch(async err => {
      await updateJob(jobId, { status: JobStatus.FAILED });

      res.status(500).send(err);
      return;
    });

  await createNewImage(jobId, blobId)

  // TODO: make request to resize image; update status to PROCESSING

  res.status(200).send('New job successfully created.');
};