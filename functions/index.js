import { onRequest } from "firebase-functions/v2/https";
import { createServer } from "../dist/index.js";

const appPromise = createServer();

export const api = onRequest({ cors: true }, async (req, res) => {
  const app = await appPromise;
  return app(req, res);
});
