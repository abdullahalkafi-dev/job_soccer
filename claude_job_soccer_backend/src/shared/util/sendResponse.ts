import { Response } from 'express';
import { requestContext } from '../logger/transport';

type IData<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data?: T;
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
  // Get requestId from async context
  const context = requestContext.getStore();
  const requestId = context?.requestId;

  const resData = {
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
    ...(requestId && { requestId }), // Add requestId if available
  };
  res.status(data.statusCode).json(resData);
};

export default sendResponse;
