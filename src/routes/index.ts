import express from 'express';
import { healthcheck } from '@handlers/healthcheck'
import { handleGetJobs } from '@handlers/jobs/get';
import { handleGetJobById } from '@handlers/jobs/{jobId}/get';


const router = express.Router();

router.get('/healthcheck', healthcheck);

router.get('/jobs', handleGetJobs);
router.get('/jobs/:jobId', handleGetJobById);

export default router;
