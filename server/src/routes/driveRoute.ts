import { Hono } from "hono";
import driveController from "../controllers/campus/drives/driveController";

const app = new Hono();

app.get("/", driveController.getDrives);
app.get("/:id", driveController.getDrive);
app.post("/create", driveController.createDrive);
app.post("/workflow/create", driveController.createWorkflow);

app.post("/ats", driveController.updateAts);
app.post("/assessment", driveController.updateAssessment);

export default app;
