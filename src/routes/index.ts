import express from 'express';
import { healthcheck } from '@handlers/healthcheck'


const router = express.Router();

router.get('/healthcheck', healthcheck);

export default router;
