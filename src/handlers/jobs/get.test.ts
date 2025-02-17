import { handleGetJobs } from './get';
import { mockRequestResponse } from '../../../test/mocks/mockExpress';
import { getJobs } from '../../database/job';


jest.mock('@database/job', () => ({
  getJobs: jest.fn()
}));

describe('GET /jobs', () => {
  let mockGetJobs: jest.Mock;

  const mockJobs = [
    { id: 1, status: 'PROCESSING', createdAt: new Date() },
    { id: 2, status: 'SUCCEEDED', createdAt: new Date() }
  ];

  beforeEach(() => {
    mockGetJobs = (getJobs as jest.Mock);
  });

  afterEach(() => {
    mockGetJobs.mockReset();
  })

  it('should query the database with request query params and return paginated results', async () => {
    const { req, res } = mockRequestResponse();
    req.query = { page: '1', limit: '10' };

    mockGetJobs.mockResolvedValue(mockJobs);

    await handleGetJobs(req, res);

    expect(getJobs).toHaveBeenCalledWith(1, 10);

    expect(res.send).toHaveBeenCalledWith({
      results: mockJobs,
      count: mockJobs.length
    });
  });

  it('should not define page and limit if they are not in request params', async () => {
    const { req, res } = mockRequestResponse();
    req.query = {};

    mockGetJobs.mockResolvedValue(mockJobs);

    await handleGetJobs(req, res);

    expect(getJobs).toHaveBeenCalledWith(undefined, undefined);

    expect(res.send).toHaveBeenCalledWith({
      results: mockJobs,
      count: mockJobs.length
    });
  });
});
