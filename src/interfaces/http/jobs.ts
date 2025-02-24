export interface GetJobsQuery {
  page?: string;
  limit?: string;
}

export interface JobByIdParams {
  jobId: string;
}

export interface PostJobBody {
  file: File;
}
