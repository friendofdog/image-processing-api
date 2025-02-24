import { ParsedQs } from 'qs';

import { IMAGE_SIZE } from "@constants/image";
import { ImageSize } from "@interfaces/image";


export interface GetJobsQuery {
  page?: string;
  limit?: string;
}

export interface JobByIdParams extends Record<string, string> {
  jobId: string;
}

export interface PostJobBody {
  size: Exclude<ImageSize, typeof IMAGE_SIZE.ORIGINAL>;
}

export interface GetImageByJobIdQuery extends ParsedQs {
  size?: string;
}

export interface PatchJobBody {
  error?: string;
  thumbnailBlobId?: string;
}
