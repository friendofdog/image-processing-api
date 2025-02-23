import { handleCreateJob } from './post';
import { mockRequestResponse } from '../../../test/mocks/mockExpress';
import { createNewJob, updateJob } from '../../database/job';
import { createNewImage } from '../../database/image';
import { uploadFile } from '../../services/imageStorage';
import { JobStatus } from '@prisma/client';


jest.mock('@database/job', () => ({
  createNewJob: jest.fn(),
  updateJob: jest.fn()
}));

jest.mock('@database/image', () => ({
  createNewImage: jest.fn()
}));

jest.mock('@services/imageStorage', () => ({
  uploadFile: jest.fn()
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-blob-id')
}));

describe('POST /jobs', () => {
  let mockCreateNewJob: jest.Mock;
  let mockUploadFile: jest.Mock;
  let mockCreateNewImage: jest.Mock;

  const { req, res } = mockRequestResponse();

  beforeEach(() => {
    mockCreateNewJob = (createNewJob as jest.Mock);
    mockUploadFile = (uploadFile as jest.Mock);
    mockCreateNewImage = (createNewImage as jest.Mock);

    req.file = {
      originalname: 'test.png',
      buffer: Buffer.from('mocked file data'),
      mimetype: 'image/png'
    } as Express.Multer.File;
    
    mockCreateNewJob.mockResolvedValue({ id: 99 });
    mockUploadFile.mockResolvedValue(null);
  });

  afterEach(() => {
    mockCreateNewJob.mockReset();
    mockUploadFile.mockReset();
    mockCreateNewImage.mockReset();
  });

  it(`when a valid file is in the request
      should create a job, upload a file, and create an image record`, async () => {
    await handleCreateJob(req, res);

    expect(mockCreateNewJob).toHaveBeenCalled();
    expect(mockUploadFile).toHaveBeenCalledWith('mocked-blob-id', 'test.png', req?.file?.buffer, 'image/png');
    expect(mockCreateNewImage).toHaveBeenCalledWith(99, 'mocked-blob-id');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('New job successfully created.');
  });

  it(`when file is invalid
      should return 400`, async () => {
    req.file = undefined;

    await handleCreateJob(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('File to upload is missing or incomplete.');
    expect(mockCreateNewJob).not.toHaveBeenCalled();
  });

  it(`when file upload fails
      should update job status to FAILED and return 500`, async () => {
    const uploadError = new Error('Upload failed');
    mockUploadFile.mockRejectedValue(uploadError);

    await handleCreateJob(req, res);

    expect(mockCreateNewJob).toHaveBeenCalled();
    expect(mockUploadFile).toHaveBeenCalled();
    expect(updateJob).toHaveBeenCalledWith(99, { status: JobStatus.FAILED });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(uploadError);
  });
});
