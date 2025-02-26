import type { Request, Response } from "express";


export const healthcheck = async (_req: Request, res: Response) => {
  res.json({ message: 'The healthcheck is working.' });
}
