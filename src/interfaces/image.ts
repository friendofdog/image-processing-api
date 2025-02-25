import { IMAGE_SIZE } from "@constants/image";
import type {
  GetObjectCommandOutput
} from '@aws-sdk/client-s3';


export type ImageSize = typeof IMAGE_SIZE[keyof typeof IMAGE_SIZE];

export interface DownloadedFileInterface {
  fileBuffer: Buffer<ArrayBufferLike>;
  metadata: GetObjectCommandOutput['Metadata'];
}
