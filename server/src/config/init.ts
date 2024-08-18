// import DopplerSDK from "@dopplerhq/node-sdk";

// async () => {
//   try {
//     console.log("Loading Doppler secrets...");
//     const doppler = new DopplerSDK({
//       accessToken: "dp.st.dev.JccdW03dbesctsDbN88WNH9WfdLGD3OQbeUGfxl0R0k",
//     });

//     const secrets = doppler.secrets
//       .list("scriptopia-server", "dev")
//       .then((res) => {
//         return res;
//       });

//     // Load secrets into process.env
//     Object.keys(secrets).forEach((key) => {
//       process.env[key] = secrets[key].raw;
//     });

//     console.log("Doppler secrets loaded into process.env");
//   } catch (error) {
//     console.error("Error loading secrets from Doppler:", error);
//     process.exit(1);
//   }
// };

import "dotenv/config";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@hono/clerk-auth";

import performanceMiddleware from "../middlewares/performanceMiddleware";
import authMiddleware from "../middlewares/authMiddleware";

import "./lemonSqueezy";
import "../utils/logger";
import "./db";
import "./cache";
import "./loops";
import "./clerk";
import "newrelic";

import homeRoute from "../routes/homeRoute";
import problemRoute from "../routes/problemsRoute";
import assessmentRoute from "../routes/assessmentRoute";
import submissionRoute from "../routes/submissionRoute";
import organizationRoute from "../routes/organizationRoute";
import userRoute from "../routes/userRoute";
import instituteRoute from "../routes/instituteRoute";

const app = new Hono();

// @ts-expect-error - Types Not Available
app.use(clerkMiddleware());
app.use(prettyJSON());
app.use(cors());
app.use(authMiddleware);
app.use(performanceMiddleware);

app.route("/home", homeRoute);
app.route("/problems", problemRoute);
app.route("/assessments", assessmentRoute);
app.route("/submissions", submissionRoute);
app.route("/organizations", organizationRoute);
app.route("/users", userRoute);
app.route("/campus", instituteRoute);

export default app;
