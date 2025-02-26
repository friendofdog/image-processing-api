import { createNewJob } from '@database/job';
import { createNewImage } from '@database/image';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { PostJobBody } from '@interfaces/http/jobs';
import { imageQueue, QUEUE_NAME } from '@services/messageQueue';
import { IMAGE_SIZE } from '@constants/image';
import { sendCreateResourceSuccess } from '@handlers/utils';


export const handleCreateJob = async (
  req: Request<any, null, PostJobBody>,
  res: Response
): Promise<void> => {
  const { size = IMAGE_SIZE.THUMBMNAIL } = req.body;

  const uploadedFile = req.file as Express.Multer.File;
  const { originalname, buffer, mimetype } = uploadedFile;

  const newJob = await createNewJob();
  const jobId = newJob.id;

  const newImage = await createNewImage(jobId)
  const imageId = newImage.id;

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

  return sendCreateResourceSuccess(res, { ...newJob, image: { ...newImage } });
};