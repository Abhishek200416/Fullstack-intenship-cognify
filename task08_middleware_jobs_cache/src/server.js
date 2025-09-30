import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import apicache from "apicache";
import path from "path";
import { fileURLToPath } from "url";

import { heavyCompute } from "./heavy.js";
import { queue as buildQueue } from "./queue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 3007,
  NODE_ENV = "development",
  RATE_WINDOW_MS = "60000",
  RATE_MAX = "120"
} = process.env;

const app = express();
const q = buildQueue();

// --- Security & core middleware ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"],
        "object-src": ["'none'"]
      }
    }
  })
);
app.use(compression());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());

// --- Logging + per-request timing ---
const logger = pino({ level: NODE_ENV === "production" ? "info" : "debug" });
app.use(
  pinoHttp({
    logger,
    genReqId: (req) =>
      req.headers["x-request-id"] ||
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    req.log.info({ ms }, `Handled ${req.method} ${req.originalUrl}`);
  });
  next();
});

// --- Server-side cache (memory) ---
apicache.options({
  appendKey: (req) => `u:${req.ip}`,
  statusCodes: { include: [200] }
});
const cache = apicache.middleware;

// --- Rate limit only heavy endpoints ---
const limiter = rateLimit({
  windowMs: Number(RATE_WINDOW_MS),
  max: Number(RATE_MAX),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(["/api/heavy", "/api/enqueue"], limiter);

// --- Routes ---

// Health (in-memory version)
app.get("/api/health", (req, res) => {
  const rep = q.getLatestReport();
  res.json({
    status: "ok",
    nodeEnv: NODE_ENV,
    reportReady: Boolean(rep.generatedAt)
  });
});

// Latest scheduled report (rebuilt each minute)
app.get("/api/report", (req, res) => {
  res.json(q.getLatestReport());
});

// Synchronous heavy endpoint with 30s cache
app.get("/api/heavy", cache("30 seconds"), (req, res) => {
  const n = Number(req.query.n || 200000);
  const value = heavyCompute(n);
  res.json({ generatedAt: new Date().toISOString(), value, n });
});

// Enqueue a background compute job
app.post("/api/enqueue", (req, res) => {
  const n = Number(req.query.n || req.body?.n || 200000);
  const id = q.addJob(n);
  res.status(202).json({ enqueued: true, id, n });
});

// Poll job state/result
app.get("/api/job/:id", (req, res) => {
  res.json(q.getJob(req.params.id));
});

// Static page
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "index.html"))
);

// Errors
app.use((err, req, res, _next) => {
  req.log.error(err);
  res.status(500).json({ error: "Internal Server Error", detail: err.message });
});

// Start + graceful shutdown
const server = app.listen(Number(PORT), () =>
  logger.info(`Task08 http://localhost:${PORT}`)
);
function shutdown() {
  logger.info("Shutting down…");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 3000);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
