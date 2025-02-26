import { handleGetJobImage } from './get';
import { getJobWithImage } from '../../../../database/job';
import { mockRequestResponse } from '../../../../../test/mocks/mockExpress';
import { downloadFileByBlobId } from '../../../../services/imageStorage';
import { sendNotFoundError, sendServerError } from '../../../utils';
import { JobStatus } from '@prisma/client';
import { Readable } from 'stream';
import { IMAGE_SIZE } from '../../../../constants/image';


const { ORIGINAL, THUMBMNAIL } = IMAGE_SIZE;

const jobId = 123;
const thumbnailBlobId = 'mocked-thumbnail-blob-id';
const originalBlobId = 'mocked-original-blob-id';

jest.mock('@database/job', () => ({
  getJobWithImage: jest.fn()
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

describe('GET /jobs/{jobId}/image', () => {
  let mockGetJobWithImage: jest.Mock;
  let mockDownloadFileByBlobId: jest.Mock;

  const { req, res } = mockRequestResponse();

  beforeEach(() => {
    mockGetJobWithImage = (getJobWithImage as jest.Mock);
    mockDownloadFileByBlobId = (downloadFileByBlobId as jest.Mock);

    req.params = { jobId };
    
    mockGetJobWithImage.mockResolvedValue({
      status: JobStatus.SUCCEEDED,
      image: { originalBlobId, thumbnailBlobId }
    });

    mockDownloadFileByBlobId.mockResolvedValue({
      fileBuffer: Buffer.from('mocked file data'),
      metadata: { original_filename: 'test.png', mimetype: 'image/png' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when image can be downloaded
      and no size is present in request
      should default to ${THUMBMNAIL}
      and stream the image`, async () => {
    const mockReadableStream = Readable.from({} as any);
    await handleGetJobImage(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test.png');

    expect(downloadFileByBlobId).toHaveBeenCalledWith(thumbnailBlobId)
    expect(mockReadableStream.pipe).toHaveBeenCalled();
  });

  it(`when image can be downloaded
      and size is present in request
      should prioritise the value for size`, async () => {
    const queryWithSize = { ...req.query, size: ORIGINAL };

    await handleGetJobImage({ ...req, query: queryWithSize } as any, res);

    expect(downloadFileByBlobId).toHaveBeenCalledWith(originalBlobId)
  });

  it(`when no job is found
      should return 404`, async () => {
    mockGetJobWithImage.mockResolvedValue(null);

    await handleGetJobImage(req, res);

    expect(sendNotFoundError).toHaveBeenCalledWith(res, `No job with ${THUMBMNAIL} image found for ID ${jobId}.`);
  });

  it(`when job status is not SUCCEEDED
      should return 500`, async () => {
    mockGetJobWithImage.mockResolvedValue({ status: JobStatus.FAILED, image: {} });

    await handleGetJobImage(req, res);

    expect(sendServerError).toHaveBeenCalledWith(res, `Cannot retrieve ${THUMBMNAIL} image for job with status ${JobStatus.FAILED}.`);
  });

  it(`when no thumbnail image is found
      should return 404`, async () => {
    mockGetJobWithImage.mockResolvedValue({ status: JobStatus.SUCCEEDED, image: null });

    await handleGetJobImage(req, res);

    expect(sendNotFoundError).toHaveBeenCalledWith(res, `No ${THUMBMNAIL} image found for ID ${jobId}.`);
  });


  it(`when no image can be downloaded
      should return 404`, async () => {
    mockDownloadFileByBlobId.mockResolvedValueOnce({});

    await handleGetJobImage(req, res);

    expect(sendNotFoundError).toHaveBeenCalledWith(res, `No ${THUMBMNAIL} image was found for blob ID ${thumbnailBlobId}.`);
  });
});
