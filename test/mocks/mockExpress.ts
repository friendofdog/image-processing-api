import { Request, Response } from "express";
import { jest } from "@jest/globals";


export const mockRequestResponse = () => {
  const req = {} as Request<any, any, any, any>;
  const res = {
    send: jest.fn(),
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    setHeader: jest.fn()
  } as any as Response;

  return { req, res };
};
