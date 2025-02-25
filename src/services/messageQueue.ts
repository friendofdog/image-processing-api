import { Queue, Worker } from 'bullmq';
import { processImage } from '@services/imageProcessing';
import { uploadFile } from '@services/imageStorage';
import { updateImage } from '@database/image';
import { IMAGE_SIZE } from '@constants/image';
import { updateJob } from '@database/job';
import { JobStatus } from '@prisma/client';
import { ImageSize } from '@interfaces/image';


const { ORIGINAL, THUMBMNAIL } = IMAGE_SIZE;

const IMAGE_MODEL_ROWS = {
  [ORIGINAL]: 'originalBlobId',
  [THUMBMNAIL]: 'thumbnailBlobId'
};
const CONNECTION = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379')
};

type ImageModelValue = (typeof IMAGE_MODEL_ROWS)[keyof typeof IMAGE_MODEL_ROWS];


interface ImageProcessingWorkerInterface {
  blobId: string;
  fileContent: { type: "Buffer"; data: number[]; };
  fileName: string;
  imageId: number;
  jobId: number;
  mimetype: string;
  sizes: ImageSize[]
}

export const QUEUE_NAME = 'image-processing';

const imageQueue = new Queue(QUEUE_NAME, {
  connection: CONNECTION
});

const imageWorker = new Worker<ImageProcessingWorkerInterface>(
  QUEUE_NAME,
  async job => {
    const {
      blobId, fileContent, fileName, mimetype, sizes
    } = job.data;
    const buffer = Buffer.from(fileContent.data);
    
    const blobIdsByRowName: Map<ImageModelValue, string> = new Map();

    await Promise.all(
      sizes.map(async resolution => {
        let resizedImage;
        if (resolution !== ORIGINAL) {
          resizedImage = await processImage(buffer, resolution);
        }
        const uploadedBlobId = await uploadFile(
          `${resolution}/${blobId}`,
          fileName,
          resizedImage || buffer,
          mimetype
        );

        blobIdsByRowName.set(IMAGE_MODEL_ROWS[resolution], uploadedBlobId)
        console.info(`✅ ${resolution} uploaded for ${fileName}`)
      })
    );

    return blobIdsByRowName;
  }, {
    connection: CONNECTION
  }
);

imageWorker.on('completed', async job => {
  const { imageId, jobId } = job.data;
  const dataToUpdate = Object.fromEntries(job.returnvalue);

  await updateImage(imageId, dataToUpdate);
  await updateJob(jobId, { status: JobStatus.SUCCEEDED });
});

imageWorker.on('failed', async (job, err) => {
  if (job) {
    const { jobId } = job.data;
    await updateJob(jobId, { status: JobStatus.FAILED });
  }

  console.error(`❌ Job failed with error: ${err}`);
});

export { imageQueue };
