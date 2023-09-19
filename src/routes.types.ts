import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

export type MyRequest = ExpressRequest & {
  user: any;
  auth: string;
  // Add any custom properties or overrides specific to your application
};

export type MyResponse = ExpressResponse & {
  // Add any custom properties or overrides specific to your application
};
