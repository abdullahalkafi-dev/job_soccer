import { NextFunction, Request, Response } from "express";
import { logger } from "../logger/logger";

const validateRequest =
  (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(req.body);
      console.log(req.body);
      await schema.parseAsync({
        body: req.body || {},
        params: req.params,
        query: req.query,
        cookies: req.cookies,
        data: req.body?.data ? JSON.parse(req.body.data) : null,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
export default validateRequest;
