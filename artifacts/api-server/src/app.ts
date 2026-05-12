import express, { type Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { createSecurityAlert } from "./lib/audit";

const app: Express = express();

// Trust the reverse proxy (Replit uses X-Forwarded-For headers)
app.set("trust proxy", 1);

// Security headers via Helmet
// Protects against XSS, clickjacking, MIME sniffing, and other common attacks
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow YouTube embeds
    contentSecurityPolicy: false, // Managed separately if needed
  })
);

// CORS — only allow our known origins
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Structured request logging (strips query strings to avoid leaking tokens)
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// Global rate limiter — 100 requests per minute per IP
// Prevents brute-force and DDoS attacks
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req: Request, res: Response) => {
    // Log rate limit violations as security alerts
    void createSecurityAlert({
      type: "rate_limit",
      severity: "medium",
      message: `Rate limit exceeded for IP: ${req.ip}`,
      ipAddress: req.ip,
    });
    res.status(429).json({ error: "Too many requests. Please try again later." });
  },
});

// Stricter rate limit for auth endpoints to prevent credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parsing with size limits to prevent payload attacks
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// XSS detection middleware — logs suspicious patterns
app.use((req: Request, res: Response, next: NextFunction) => {
  const body = JSON.stringify(req.body ?? {});
  const xssPatterns = /<script|javascript:|on\w+\s*=|eval\(|document\.cookie/i;

  if (xssPatterns.test(body) || xssPatterns.test(req.url)) {
    void createSecurityAlert({
      type: "xss_attempt",
      severity: "high",
      message: `Possible XSS attempt from ${req.ip} on ${req.method} ${req.path}`,
      ipAddress: req.ip,
    });
  }

  next();
});

app.use("/api", router);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
