import logger from "../utils/logger";
import { createMiddleware } from "hono/factory";
import { hrtime } from "process";

const performanceLogger = createMiddleware(async (c, next) => {
  const start = hrtime.bigint();

  return next().then(() => {
    const end = hrtime.bigint();
    const cached = c.get("cached") || false;
    const durationInMs = Number((end - start) / BigInt(1000000)).toFixed(2);

    const logMessage = `${c.req.method} ${c.req.path} - Time: ${durationInMs}ms (Cached: ${cached})`;
    logger.warn(logMessage);
  });
});

export default performanceLogger;
