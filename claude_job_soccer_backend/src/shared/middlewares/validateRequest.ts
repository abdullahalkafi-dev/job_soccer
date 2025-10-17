import { NextFunction, Request, Response } from "express";
import { Schema } from "zod";


const validateRequest =
  (schema: Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req?.body);

    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
        data: req.body.data ? JSON.parse(req?.body?.data) : null,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
export default validateRequest;
