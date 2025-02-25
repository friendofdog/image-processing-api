import { IMAGE_SIZE } from "@constants/image";
import { ImageSize } from "@interfaces/image";


export interface GetJobsQuery {
  page?: string;
  limit?: string;
}

export interface JobByIdParams {
  jobId: string;
}

export interface PostJobBody {
  size: Exclude<ImageSize, typeof IMAGE_SIZE.ORIGINAL>;
}
