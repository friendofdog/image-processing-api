import { handleGetJobById } from './get';
import { mockRequestResponse } from '../../../../test/mocks/mockExpress';
import { getJobById } from '../../../database/job';
import { JobStatus } from '@prisma/client';


jest.mock('@database/job', () => ({
  getJobById: jest.fn()
}));

describe('GET /jobs', () => {
  let mockGetJobById: jest.Mock;

  const jobId = '99';
  const mockJobWithImages = {
    id: 1,
    status: JobStatus.SUCCEEDED,
    createdAt: new Date(),
    images: []
  };

  beforeEach(() => {
    mockGetJobById = (getJobById as jest.Mock);
  });

  afterEach(() => {
    mockGetJobById.mockReset();
  })

  it(`when a job is found for a given ID
      should return that job with images`, async () => {
    const { req, res } = mockRequestResponse();
    req.params = { jobId }

    mockGetJobById.mockResolvedValue(mockJobWithImages);

    await handleGetJobById(req, res);

    expect(getJobById).toHaveBeenCalledWith(parseInt(jobId));

    expect(res.send).toHaveBeenCalledWith(mockJobWithImages);
  });

  it(`when no job is found for a given ID
      should return 404 error`, async () => {
    const { req, res } = mockRequestResponse();
    req.params = { jobId }

    mockGetJobById.mockResolvedValue(null);

    await handleGetJobById(req, res);

    expect(getJobById).toHaveBeenCalledWith(parseInt(jobId));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(`Cannot find job with ID ${jobId}`);
  });
});
