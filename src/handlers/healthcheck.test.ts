import { healthcheck } from './healthcheck'
import { mockRequestResponse } from "../../test/mocks/mockExpress";


describe("GET /healthcheck", () => {
  it("should send the correct healthcheck message", async () => {
    const { req, res } = mockRequestResponse();

    await healthcheck(req, res);

    expect(res.send).toHaveBeenCalledWith("The healthcheck is working.");
  });
});
