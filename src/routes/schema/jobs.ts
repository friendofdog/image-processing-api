import { ALLOWED_MIME_TYPES, IMAGE_MAX_SIZE_KB, IMAGE_SIZE } from '@constants/image';
import type { Schema } from 'express-validator';


const { ORIGINAL, THUMBMNAIL } = IMAGE_SIZE;

export const getJobsSchema: Schema = {
  page: {
    in: ['query'],
    exists: { errorMessage: 'Page is required' },
    isInt: { options: { min: 1 }, errorMessage: 'Page must be a positive integer' },
    optional: true
  },
  limit: {
    in: ['query'],
    exists: { errorMessage: 'Limit is required' },
    isInt: { options: { min: 1 }, errorMessage: 'Limit must be a positive integer' },
    optional: true
  }
};

export const createJobSchema: Schema = {
  size: {
    in: ['body'],
    isIn: {
      options: [[THUMBMNAIL]],
      errorMessage: `Size must be '${THUMBMNAIL}'`
    },
    optional: true
  },
  file: {
    in: ['body'],
    custom: {
      options: (_, { req }) => {
        if (!req.file) {
          throw new Error('File is required');
        }

        if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
          throw new Error(`File must be one of ${ALLOWED_MIME_TYPES.join(', ')}`);
        }

        const fileSizeKB = req.file.size / 1024;
        if (fileSizeKB > IMAGE_MAX_SIZE_KB) {
          throw new Error(`File must be less than ${IMAGE_MAX_SIZE_KB} KB`);
        }

        return true;
      }
    }
  }
};

export const getJobByIdSchema: Schema = {
  jobId: {
    in: ['params'],
    isInt: { options: { min: 1 }, errorMessage: 'Job ID must be a positive integer' }
  },
  size: {
    in: ['query'],
    isIn: {
      options: [[ORIGINAL, THUMBMNAIL]],
      errorMessage: `Size must be '${ORIGINAL}' or '${THUMBMNAIL}'`
    },
    optional: true
  }
};
