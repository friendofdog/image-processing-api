import { handleCreateJob } from './post';
import { mockRequestResponse } from '../../../test/mocks/mockExpress';
import { createNewJob } from '../../database/job';
import { createNewImage } from '../../database/image';
import { imageQueue } from '../../services/messageQueue';
import { IMAGE_SIZE } from '../../constants/image';


const mockImageId = 99;
const mockJobId = 22;
const mockBlobId = 'mocked-blob-id';

jest.mock('@database/job', () => ({
  createNewJob: jest.fn()
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

describe('POST /jobs', () => {
  let mockCreateNewJob: jest.Mock;
  let mockImageQueueAdd: jest.Mock;
  let mockCreateNewImage: jest.Mock;

  const { req, res } = mockRequestResponse();

  beforeEach(() => {
    mockCreateNewImage = (createNewImage as jest.Mock).mockResolvedValue({ id: mockImageId });
    mockCreateNewJob = (createNewJob as jest.Mock).mockResolvedValue({ id: mockJobId });
    mockImageQueueAdd = (imageQueue.add as jest.Mock);

    req.body = { size: IMAGE_SIZE.THUMBMNAIL };
    req.file = {
      originalname: 'test.png',
      buffer: Buffer.from('mocked file data'),
      mimetype: 'image/png'
    } as Express.Multer.File;
  });

  afterEach(() => {
    mockCreateNewJob.mockReset();
    mockImageQueueAdd.mockReset();
    mockCreateNewImage.mockReset();
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
      sizes: [IMAGE_SIZE.ORIGINAL, IMAGE_SIZE.THUMBMNAIL]
    });
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
});
