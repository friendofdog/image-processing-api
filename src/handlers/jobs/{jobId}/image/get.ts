import { getJobWithImage } from '@database/job';
import type { DownloadedFileInterface } from '@interfaces/image';
import { JobStatus } from '@prisma/client';
import { downloadFileByBlobId } from '@services/imageStorage';
import { sendNotFoundError, sendServerError } from '@handlers/utils';
import type { Request, Response } from 'express';
import { GetImageByJobIdQuery, JobByIdParams } from 'src/interfaces/http/jobs';
import { Readable } from 'stream';
import { IMAGE_SIZE } from '@constants/image';


export const handleGetJobImage = async (
  req: Request<JobByIdParams, null, null, GetImageByJobIdQuery>,
  res: Response
) => {
  const { ORIGINAL, THUMBMNAIL } = IMAGE_SIZE;

  const { jobId } = req.params;
  const size = req.query?.size || THUMBMNAIL;

  const jobWithImage = await getJobWithImage(parseInt(jobId));

  if (!jobWithImage) {
    return sendNotFoundError(res, `No job with ${size} image found for ID ${jobId}.`);
  }

  const { status, image } = jobWithImage;
  let blobId;

  switch(size) {
    case ORIGINAL:
      blobId = image?.originalBlobId;
      break;
    case THUMBMNAIL:
    default:
      blobId = image?.thumbnailBlobId;
  }

  if (status !== JobStatus.SUCCEEDED) {
    return sendServerError(res, `Cannot retrieve ${size} image for job with status ${status}.`);
  }

  if (!blobId) {
    return sendNotFoundError(res, `No ${size} image found for ID ${jobId}.`);
  }

  const { fileBuffer, metadata } = await downloadFileByBlobId(blobId)
    .catch(_ => {}) as DownloadedFileInterface;

  if (fileBuffer && metadata) {
    const readableStream = Readable.from(fileBuffer);
    const filename = metadata.original_filename || 'unnamed';

    res.setHeader('Content-Type', metadata.mimetype || 'image');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    readableStream.pipe(res);
  } else {
    return sendNotFoundError(res, `No ${size} image was found for blob ID ${blobId}.`);
  }
};
