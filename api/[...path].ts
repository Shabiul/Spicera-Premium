import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from '../server/index';

let app: express.Application | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    app = await createServer();
  }
  
  // Convert Vercel request to Express request format
  const expressReq = req as any;
  const expressRes = res as any;
  
  // Handle the request with Express
  app(expressReq, expressRes);
}