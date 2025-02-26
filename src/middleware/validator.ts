import { Request, Response, NextFunction, RequestHandler } from 'express';
import { checkSchema, Schema, validationResult } from 'express-validator';


export const validate = (schema: Schema): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(checkSchema(schema).map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    next();
  };
};
