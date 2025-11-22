import "dotenv/config";
import { onRequest } from "firebase-functions/v2/https";
import { createApp } from "./dist/app.js";

const appPromise = createApp();

export const api = onRequest({ cors: true }, async (req, res) => {
  const app = await appPromise;
  return app(req, res);
});
