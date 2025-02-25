import { ImageSize } from "@interfaces/image";


export interface GetJobsQuery {
  page?: string;
  limit?: string;
}

export interface JobByIdParams {
  jobId: string;
}

export interface PostJobBody {
  sizes: ImageSize[];
}
