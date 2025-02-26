import { handleGetJobs } from './get';
import { mockRequestResponse } from '../../../test/mocks/mockExpress';
import { getJobs } from '../../database/job';
import { sendGetPaginatedSuccess } from '../utils';
import { JobStatus } from '@prisma/client';


jest.mock('@database/job', () => ({
  getJobs: jest.fn()
}));

jest.mock('@handlers/utils', () => ({
  sendGetPaginatedSuccess: jest.fn()
}));

describe('GET /jobs', () => {
  let mockGetJobs: jest.Mock;

  const mockJobs = [
    { id: 1, status: JobStatus.PROCESSING, createdAt: new Date() },
    { id: 2, status: JobStatus.SUCCEEDED, createdAt: new Date() }
  ];

  beforeEach(() => {
    mockGetJobs = (getJobs as jest.Mock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it(`when page and limit are included in request query
      should call getter function with arguments
      and return paginated results`, async () => {
    const { req, res } = mockRequestResponse();
    req.query = { page: '1', limit: '10' };

    mockGetJobs.mockResolvedValue(mockJobs);

    await handleGetJobs(req, res);

    expect(getJobs).toHaveBeenCalledWith(1, 10);
    expect(sendGetPaginatedSuccess).toHaveBeenCalledWith(res, mockJobs);
  });

  it(`when page and limit are included in request query
      should call getter function with no arguments
      and return paginated results`, async () => {
    const { req, res } = mockRequestResponse();
    req.query = {};

    mockGetJobs.mockResolvedValue(mockJobs);

    await handleGetJobs(req, res);

    expect(getJobs).toHaveBeenCalledWith(undefined, undefined);
    expect(sendGetPaginatedSuccess).toHaveBeenCalledWith(res, mockJobs);
  });
});
