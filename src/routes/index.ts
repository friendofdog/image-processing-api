import express from 'express';
import { healthcheck } from '@handlers/healthcheck';
import { handleGetJobs } from '@handlers/jobs/get';
import { handleCreateJob } from '@handlers/jobs/post';
import { handleGetJobById } from '@handlers/jobs/{jobId}/get';
import { handleGetJobImage } from '@handlers/jobs/{jobId}/image/get';
import upload from '@middleware/upload';
import { validate } from '@middleware/validator';
import {
  getJobsSchema,
  createJobSchema,
  getJobByIdSchema
} from '@routes/schema/jobs';


const router = express.Router();

router.get('/healthcheck', healthcheck);
router.get('/jobs', validate(getJobsSchema), handleGetJobs);
router.get('/jobs/:jobId', validate(getJobByIdSchema), handleGetJobById);
router.get('/jobs/:jobId/image', validate(getJobByIdSchema), handleGetJobImage);
router.post('/jobs', upload.single('file'), validate(createJobSchema), handleCreateJob);

export default router;
