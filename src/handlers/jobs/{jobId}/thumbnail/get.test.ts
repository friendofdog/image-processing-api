import { handleGetThumbnailImage } from './get';
import { getJobWithThumbnail } from '../../../../database/job';
import { mockRequestResponse } from '../../../../../test/mocks/mockExpress';
import { downloadFileByBlobId } from '../../../../services/imageStorage';
import { JobStatus } from '@prisma/client';
import { Readable } from 'stream';


jest.mock('@database/job', () => ({
  getJobWithThumbnail: jest.fn()
}));

jest.mock('@services/imageStorage', () => ({
  downloadFileByBlobId: jest.fn()
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
    mockGetJobWithThumbnail.mockReset();
    mockDownloadFileByBlobId.mockReset();
  });

  it(`when no job is found
      should return 404`, async () => {
    mockGetJobWithThumbnail.mockResolvedValue(null);

    await handleGetThumbnailImage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No job with thumbnail image found for ID 123.');
  });

  it(`when job status is not SUCCEEDED
      should return 500`, async () => {
    mockGetJobWithThumbnail.mockResolvedValue({ status: JobStatus.FAILED, image: {} });

    await handleGetThumbnailImage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Cannot retrieve image for job with status FAILED.');
  });

  it(`when no thumbnail image is found
      should return 404`, async () => {
    mockGetJobWithThumbnail.mockResolvedValue({ status: JobStatus.SUCCEEDED, image: null });

    await handleGetThumbnailImage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No thumbnail image found for this job.');
  });


  it(`when image is downloaded
      should stream image`, async () => {
    const mockReadableStream = Readable.from({} as any);
    await handleGetThumbnailImage(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test.png');

    expect(mockReadableStream.pipe).toHaveBeenCalled();
  });
});
