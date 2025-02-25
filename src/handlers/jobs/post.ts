import { createNewJob } from '@database/job';
import { createNewImage } from '@database/image';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { PostJobBody } from '@interfaces/http/jobs';
import { imageQueue, QUEUE_NAME } from '@services/messageQueue';


interface MulterRequest extends Request {
  body: PostJobBody;
}


export const handleCreateJob = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  if (!req?.file) {
    res.status(400).send('File to upload is missing or incomplete.');
    return;
  }

  const { sizes } = req.body;
  const { originalname, buffer, mimetype } = req.file;

  const { id: jobId } = await createNewJob();
  const blobId = randomUUID();

  const { id: imageId } = await createNewImage(jobId)

  await imageQueue.add(QUEUE_NAME, {
    blobId,
    fileContent: buffer,
    fileName: originalname,
    imageId,
    jobId,
    mimetype,
    sizes
  });

  res.status(200).send('New job successfully created.');
};