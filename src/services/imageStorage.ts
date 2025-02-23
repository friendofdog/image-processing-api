import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { createHash } from 'node:crypto';


interface DownloadedFileInterface {
  fileBuffer: Buffer<ArrayBufferLike>;
  metadata: GetObjectCommandOutput['Metadata'];
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
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
): Promise<void> => {
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
  
  try {
    const res = await s3Client.send(putCommand);

    if (res?.ChecksumSHA256 !== ChecksumSHA256) {
      throw new Error('Checksum mismatch: file upload might be corrupted.');
    }
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw new Error('An error occured while upload the file.');
  }
};

export const downloadFileByBlobId = async (blobId: string): Promise<DownloadedFileInterface> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: blobId
    });

    const response = await s3Client.send(command);
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
  } catch (error) {
    console.error('❌ Error downloading file:', error);
    throw new Error('Failed to download file.');
  }
};
