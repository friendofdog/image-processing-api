import { handleCreateJob } from './post';
import { mockRequestResponse } from 'test/mocks/mockExpress';
import { createNewJob, updateJob } from '@database/job';
import { createNewImage } from '@database/image';
import { imageQueue } from '@services/messageQueue';
import { IMAGE_SIZE } from '@constants/image';
import { sendCreateResourceSuccess } from '@handlers/utils';
import { JobStatus } from '@prisma/client';


const { ORIGINAL, THUMBMNAIL } = IMAGE_SIZE;

const mockImageId = 99;
const mockJobId = 22;
const mockBlobId = 'mocked-blob-id';

jest.mock('@database/job', () => ({
  createNewJob: jest.fn(),
  updateJob: jest.fn()
}));

jest.mock('@database/image', () => ({
  createNewImage: jest.fn()
}));

jest.mock('@services/messageQueue', () => ({
  imageQueue: { add: jest.fn() },
  QUEUE_NAME: 'mock-queue-name'
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => mockBlobId)
}));

jest.mock('@handlers/utils', () => ({
  sendCreateResourceSuccess: jest.fn()
}));

describe('POST /jobs', () => {
  let mockCreateNewJob: jest.Mock;
  let mockUpdateJob: jest.Mock;
  let mockImageQueueAdd: jest.Mock;
  let mockCreateNewImage: jest.Mock;

  const { req, res } = mockRequestResponse();

  beforeEach(() => {
    mockCreateNewImage = (createNewImage as jest.Mock).mockResolvedValue({ id: mockImageId });
    mockCreateNewJob = (createNewJob as jest.Mock).mockResolvedValue({ id: mockJobId });
    mockUpdateJob = (updateJob as jest.Mock);
    mockImageQueueAdd = (imageQueue.add as jest.Mock);

    req.body = { size: THUMBMNAIL };
    req.file = {
      originalname: 'test.png',
      buffer: Buffer.from('mocked file data'),
      mimetype: 'image/png'
    } as Express.Multer.File;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`when a valid file is in the request
      should create a job and an image
      send notification to message queue
      and return a 200 response`, async () => {
    await handleCreateJob(req, res);

    expect(mockCreateNewJob).toHaveBeenCalled();
    expect(mockCreateNewImage).toHaveBeenCalledWith(mockJobId);
    expect(mockImageQueueAdd).toHaveBeenCalledWith('mock-queue-name', {
      blobId: mockBlobId,
      fileContent: Buffer.from('mocked file data'),
      fileName: 'test.png',
      imageId: mockImageId,
      jobId: mockJobId,
      mimetype: 'image/png',
      sizes: [ORIGINAL, THUMBMNAIL]
    });
    expect(mockUpdateJob).toHaveBeenCalledWith(mockJobId, { status: JobStatus.PROCESSING });
    expect(sendCreateResourceSuccess).toHaveBeenCalledWith(res, { id: mockJobId, image: { id: mockImageId } });
  });

  it(`when size is not included in request body
      defaults to ${THUMBMNAIL}`, async () => {
    req.body = {};
    await handleCreateJob(req, res);

    expect(mockImageQueueAdd).toHaveBeenCalledWith('mock-queue-name', {
      blobId: mockBlobId,
      fileContent: Buffer.from('mocked file data'),
      fileName: 'test.png',
      imageId: mockImageId,
      jobId: mockJobId,
      mimetype: 'image/png',
      sizes: [ORIGINAL, THUMBMNAIL]
    });
  });
});
