import express from 'express';
import { healthcheck } from '@handlers/healthcheck'
import { handleGetJobs } from '@handlers/jobs/get';


const router = express.Router();

router.get('/healthcheck', healthcheck);
router.get('/jobs', handleGetJobs);

export default router;
