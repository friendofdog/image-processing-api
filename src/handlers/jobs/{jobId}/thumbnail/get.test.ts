import { handleGetJobThumbnail } from './get';
import { getJobWithThumbnail } from '../../../../database/job';
import { mockRequestResponse } from '../../../../../test/mocks/mockExpress';
import { downloadFileByBlobId } from '../../../../services/imageStorage';
import { sendNotFoundError, sendServerError } from '../../../utils';
import { JobStatus } from '@prisma/client';
import { Readable } from 'stream';


jest.mock('@database/job', () => ({
  getJobWithThumbnail: jest.fn()
}));

jest.mock('@services/imageStorage', () => ({
  downloadFileByBlobId: jest.fn()
}));

jest.mock('@handlers/utils', () => ({
  sendNotFoundError: jest.fn(),
  sendServerError: jest.fn()
}));

jest.mock('stream', () => ({
  Readable: { from: jest.fn().mockReturnValue({ pipe: jest.fn() }) }
}));

describe('GET /jobs/{jobId}/thumbnail', () => {
  let mockGetJobWithThumbnail: jest.Mock;
  let mockDownloadFileByBlobId: jest.Mock;

  const { req, res } = mockRequestResponse();

  beforeEach(() => {
    mockGetJobWithThumbnail = (getJobWithThumbnail as jest.Mock);
    mockDownloadFileByBlobId = (downloadFileByBlobId as jest.Mock);

    req.params = { jobId: '123' };
    
    mockGetJobWithThumbnail.mockResolvedValue({
      status: JobStatus.SUCCEEDED,
      image: { thumbnailBlobId: 'mocked-blob-id' }
    });
    mockDownloadFileByBlobId.mockResolvedValue({
      fileBuffer: Buffer.from('mocked file data'),
      metadata: { original_filename: 'test.png', mimetype: 'image/png' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when no job is found
      should return 404`, async () => {
    mockGetJobWithThumbnail.mockResolvedValue(null);

    await handleGetJobThumbnail(req, res);

    expect(sendNotFoundError).toHaveBeenCalledWith(res, 'No job with thumbnail image found for ID 123.');
  });

  it(`when job status is not SUCCEEDED
      should return 500`, async () => {
    mockGetJobWithThumbnail.mockResolvedValue({ status: JobStatus.FAILED, image: {} });

    await handleGetJobThumbnail(req, res);

    expect(sendServerError).toHaveBeenCalledWith(res, 'Cannot retrieve image for job with status FAILED.');
  });

  it(`when no thumbnail image is found
      should return 404`, async () => {
    mockGetJobWithThumbnail.mockResolvedValue({ status: JobStatus.SUCCEEDED, image: null });

    await handleGetJobThumbnail(req, res);

    expect(sendNotFoundError).toHaveBeenCalledWith(res, 'No thumbnail image found for ID 123.');
  });


  it(`when image is downloaded
      should stream image`, async () => {
    const mockReadableStream = Readable.from({} as any);
    await handleGetJobThumbnail(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test.png');

    expect(mockReadableStream.pipe).toHaveBeenCalled();
  });

  it(`when no image can be downloaded
      should return 404`, async () => {
    mockDownloadFileByBlobId.mockResolvedValueOnce({});

    await handleGetJobThumbnail(req, res);

    expect(sendNotFoundError).toHaveBeenCalledWith(res, 'No thumbnail image was found for blob ID mocked-blob-id.');
  });
});
