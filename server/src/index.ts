import "dotenv/config";
import app from "./config/init";
import logger from "./utils/logger";

const port = parseInt(process.env.PORT!);

app.get("/health", (c) => {
  return c.json({ status: "ok", version: process.env.VERSION });
});

app.get("/*", (c) => {
  return c.json({ status: "not found" }, 404);
});

logger.info(`Server is running on port ${port}`);
