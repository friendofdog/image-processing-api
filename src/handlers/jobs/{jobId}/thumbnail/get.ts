import { getJobWithThumbnail } from '@database/job';
import type { DownloadedFileInterface } from '@interfaces/image';
import { JobStatus } from '@prisma/client';
import { downloadFileByBlobId } from '@services/imageStorage';
import { sendNotFoundError, sendServerError } from '@handlers/utils';
import type { Request, Response } from 'express';
import { JobByIdParams } from 'src/interfaces/http/jobs';
import { Readable } from 'stream';


export const handleGetJobThumbnail = async (
  req: Request<JobByIdParams>,
  res: Response
) => {
  const { jobId } = req.params;

  const jobWithThumbnail = await getJobWithThumbnail(parseInt(jobId));

  if (!jobWithThumbnail) {
    return sendNotFoundError(res, `No job with thumbnail image found for ID ${jobId}.`);
  }

  const { status, image } = jobWithThumbnail;
  const { thumbnailBlobId } = image || {};

  if (status !== JobStatus.SUCCEEDED) {
    return sendServerError(res, `Cannot retrieve image for job with status ${status}.`);
  }

  if (!thumbnailBlobId) {
    return sendNotFoundError(res, `No thumbnail image found for ID ${jobId}.`);
  }

  const { fileBuffer, metadata } = await downloadFileByBlobId(thumbnailBlobId)
    .catch(_ => {}) as DownloadedFileInterface;

  if (fileBuffer && metadata) {
    const readableStream = Readable.from(fileBuffer);
    const filename = metadata.original_filename || 'unnamed';

    res.setHeader('Content-Type', metadata.mimetype || 'image');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    readableStream.pipe(res);
  } else {
    return sendNotFoundError(res, `No thumbnail image was found for blob ID ${thumbnailBlobId}.`);
  }
};
