import "dotenv/config";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";

import performanceMiddleware from "../middlewares/performanceMiddleware";
import authMiddleware from "../middlewares/authMiddleware";

import "../utils/logger";
import "./db";
import "./cache";
import "./loops";
import "./clerk";

import homeRoute from "../routes/homeRoute";
import problemRoute from "../routes/problemsRoute";
import assessmentRoute from "../routes/assessmentRoute";
import submissionRoute from "../routes/submissionRoute";
import organizationRoute from "../routes/organizationRoute";
import instituteRoute from "../routes/instituteRoute";
import driveRoutes from "../routes/driveRoute";
import postingRoutes from "../routes/postingRoute";
import candidateRoute from "../routes/candidateRoute";

import userRoute from "../routes/userRoute";
import { clerkMiddleware } from "@hono/clerk-auth";

import { Server } from "socket.io";
import { serve } from "@hono/node-server";
import { Server as HttpServer } from "http";
import logger from "../utils/logger";

const port = parseInt(process.env.PORT!);

const app = new Hono();

//  Hono Server
const server = serve({
  fetch: app.fetch,
  port: port,
});

// Socket.io
const ioServer = new Server(server as HttpServer, {
  path: "/socket.io",
  serveClient: false,
  allowEIO3: true,
  cors: {
    origin: "*",
  },
});

ioServer.on("error", (err) => {
  logger.error(err);
});

// @ts-ignore
app.use(clerkMiddleware());
app.use(prettyJSON());
app.use(cors());
app.use(authMiddleware);
app.use(performanceMiddleware);

app.route("/home", homeRoute);
app.route("/problems", problemRoute);
app.route("/assessments", assessmentRoute);
app.route("/submissions", submissionRoute);
app.route("/users", userRoute);

app.route("/organizations", organizationRoute);
app.route("/postings", postingRoutes);
app.route("/candidates", candidateRoute);
app.route("/institutes", instituteRoute);
app.route("/drives", driveRoutes);


export default app;
export { ioServer };
