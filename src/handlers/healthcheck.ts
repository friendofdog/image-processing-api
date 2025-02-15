import type { Request, Response } from "express";


export const healthcheck = async (_req: Request, res: Response) => {
  res.send('The healthcheck is working.');
}
