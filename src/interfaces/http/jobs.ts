export interface GetJobsQuery {
  page?: string;
  limit?: string;
}

export interface GetJobByIdParams {
  jobId: string;
}

export interface PostJobBody {
  file: Express.Multer.File
}
