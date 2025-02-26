import { handleGetJobById } from './get';
import { mockRequestResponse } from '../../../../test/mocks/mockExpress';
import { getJobById } from '../../../database/job';
import { JobStatus } from '@prisma/client';
import { sendNotFoundError, sendGetResourceSuccess } from '../../utils';


jest.mock('@database/job', () => ({
  getJobById: jest.fn()
}));

jest.mock('@handlers/utils', () => ({
  sendGetResourceSuccess: jest.fn(),
  sendNotFoundError: jest.fn()
}));

describe('GET /jobs', () => {
  let mockGetJobById: jest.Mock;

  const jobId = '99';
  const mockJobWithImageData = {
    id: 1,
    status: JobStatus.SUCCEEDED,
    createdAt: new Date(),
    images: []
  };

  beforeEach(() => {
    mockGetJobById = (getJobById as jest.Mock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it(`when a job is found for a given ID
      should return that job with images`, async () => {
    const { req, res } = mockRequestResponse();
    req.params = { jobId }

    mockGetJobById.mockResolvedValue(mockJobWithImageData);

    await handleGetJobById(req, res);

    expect(getJobById).toHaveBeenCalledWith(parseInt(jobId));
    expect(sendGetResourceSuccess).toHaveBeenCalledWith(res, mockJobWithImageData);
  });

  it(`when no job is found for a given ID
      should return 404 error`, async () => {
    const { req, res } = mockRequestResponse();
    req.params = { jobId }

    mockGetJobById.mockResolvedValue(null);

    await handleGetJobById(req, res);

    expect(getJobById).toHaveBeenCalledWith(parseInt(jobId));
    expect(sendNotFoundError).toHaveBeenCalledWith(res, `Cannot find job with ID ${jobId}`);
  });
});
