import { Request, Response } from "express";
import { jest } from "@jest/globals";


export const mockRequestResponse = () => {
  const req = {} as Request;
  const res = {
    send: jest.fn(),
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as any as Response;

  return { req, res };
};
