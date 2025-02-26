import { createNewJob } from '@database/job';
import { createNewImage } from '@database/image';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { PostJobBody } from '@interfaces/http/jobs';
import { imageQueue, QUEUE_NAME } from '@services/messageQueue';
import { IMAGE_SIZE } from '@constants/image';


export const handleCreateJob = async (
  req: Request<any, null, PostJobBody>,
  res: Response
): Promise<void> => {
  const { size = IMAGE_SIZE.THUMBMNAIL } = req.body;

  const uploadedFile = req.file as Express.Multer.File;
  const { originalname, buffer, mimetype } = uploadedFile;

  const { id: jobId } = await createNewJob();
  const { id: imageId } = await createNewImage(jobId)

  const blobId = randomUUID();
  const sizesWithOriginal = [IMAGE_SIZE.ORIGINAL, size]

  await imageQueue.add(QUEUE_NAME, {
    blobId,
    fileContent: buffer,
    fileName: originalname,
    imageId,
    jobId,
    mimetype,
    sizes: sizesWithOriginal
  });

  res.status(200).send('New job successfully created.');
};