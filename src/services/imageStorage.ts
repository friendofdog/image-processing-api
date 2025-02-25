import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { createHash } from 'node:crypto';


export interface DownloadedFileInterface {
  fileBuffer: Buffer<ArrayBufferLike>;
  metadata: GetObjectCommandOutput['Metadata'];
}

const s3Client = new S3Client({
  // region: process.env.AWS_REGION, // not used by minio
  endpoint: process.env.AWS_S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export const uploadFile = async (
  blobId: string,
  fileName: string,
  fileContent: Buffer,
  mimetype: string
): Promise<string> => {
  const ChecksumSHA256 = createHash('sha256').update(fileContent).digest('base64');

  const putCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: blobId,
    Body: fileContent,
    ChecksumSHA256,
    ContentType: mimetype,
    Metadata: {
      original_filename: fileName,
      mimetype,
      size: 'original'
    }
  });
  
  const uploadedFile = await s3Client.send(putCommand)
    .catch(err => {
      console.error('❌ Error uploading file:', err);
      throw new Error('An error occured while uploading the file.');
    });
  
  if (uploadedFile?.ChecksumSHA256 !== ChecksumSHA256) {
    throw new Error('Checksum mismatch: file upload might be corrupted.');
  }

  return blobId;
};

export const downloadFileByBlobId = async (blobId: string): Promise<DownloadedFileInterface> => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: blobId
  });

  const response = await s3Client.send(command)
    .catch(err => {
      console.error('❌ Error downloading file:', err);
      throw new Error('An error occured while downloading the file.');
    });

  const { Metadata: metadata, Body: body } = response || {};

  if (!body || !metadata) {
    throw new Error('File cannot be retrieved or is incomplete.');
  }

  const streamToBuffer = (stream: Readable): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  };

  const fileBuffer = await streamToBuffer(response.Body as Readable);

  return { fileBuffer, metadata };
};
