import { getJobWithThumbnail } from '@database/job';
import { JobStatus } from '@prisma/client';
import { downloadFileByBlobId } from '@services/imageStorage';
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
    res.status(404).send(`No job with thumbnail image found for ID ${jobId}.`);
    return;
  }

  const { status, image } = jobWithThumbnail;
  const { thumbnailBlobId } = image || {};

  if (status !== JobStatus.SUCCEEDED) {
    res.status(500).send(`Cannot retrieve image for job with status ${status}.`);
    return;
  }

  if (!thumbnailBlobId) {
    res.status(404).send('No thumbnail image found for this job.');
    return;
  }

  const { fileBuffer, metadata } = await downloadFileByBlobId(thumbnailBlobId);

  if (fileBuffer && metadata) {
    const readableStream = Readable.from(fileBuffer);
    const filename = metadata.original_filename || 'unnamed';

    res.setHeader('Content-Type', metadata.mimetype || 'image');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    readableStream.pipe(res);
  } else {
    res.status(404).send('No thumbnail image was found for blob ID.');
  }
};
