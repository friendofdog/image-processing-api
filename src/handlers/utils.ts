import type { Response } from 'express';


export const sendNotFoundError = (res: Response, message?: string) => {
  res.status(404).json({
    error: 'Not Found',
    message: message || 'Resource not found'
  });
};

export const sendServerError = (res: Response, message?: string) => {
  res.status(500).json({
    error: 'Server Error',
    message: message || 'Internal server error'
  });
};

export const sendGetResourceSuccess = (res: Response, payload: object) => {
  res.status(200).json(payload)
};

export const sendGetPaginatedSuccess = (res: Response, payload: object[]) => {
  res.status(200).json({
    results: payload,
    count: payload.length
  })
};

export const sendCreateResourceSuccess = (res: Response, message?: string) => {
  res.status(200).json({ message: message || 'Resource created' })
};
