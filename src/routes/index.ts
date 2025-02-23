import express from 'express';
import { healthcheck } from '@handlers/healthcheck'
import { handleGetJobs } from '@handlers/jobs/get';
import { handleCreateJob } from '@handlers/jobs/post';
import { handleGetJobById } from '@handlers/jobs/{jobId}/get';
import upload from '@middleware/upload';


const router = express.Router();

router.get('/healthcheck', healthcheck);

router.get('/jobs', handleGetJobs);
router.get('/jobs/:jobId', handleGetJobById);
router.post('/jobs', upload.single('file'), handleCreateJob);

export default router;
