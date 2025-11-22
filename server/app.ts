import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(): Promise<Express> {
  const app = express();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use("/src/assets", express.static(path.join(__dirname, "../client/src/assets")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const originalJson = (express.response as any).json;
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const p = req.path;
    let captured: Record<string, any> | undefined;
    (res as any).json = function (body: any, ...args: any[]) {
      captured = body;
      return originalJson.apply(res, [body, ...args]);
    } as any;
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (p.startsWith("/api")) {
        let line = `${req.method} ${p} ${res.statusCode} in ${duration}ms`;
        if (captured) {
          line += ` :: ${JSON.stringify(captured)}`;
        }
        if (line.length > 80) {
          line = line.slice(0, 79) + "…";
        }
        console.log(line);
      }
    });
    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  const distRoot = path.resolve(__dirname, "..", "dist");
  app.use(express.static(distRoot));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distRoot, "index.html"));
  });

  return app;
}
