import { Hono } from "hono";
import driveController from "../controllers/campus/drives/driveController";
import instituteWorkflowController from "../controllers/campus/workflow/instituteWorkflowController";
import candidatesController from "@/controllers/enterprise/candidates/candidatesController";

const app = new Hono();

app.get("/", driveController.getDrives);
app.get("/candidate", driveController.getDrivesForCandidate);
app.get("/candidate/:id", driveController.getDriveForCandidate);
app.get("/:id", driveController.getDrive);
app.get("/slug/:slug", driveController.getDriveBySlug);

//app.get("/candidate/drives", candidateDriveController.getPublicDrives);
//app.get("/candidate/drives/:slug", candidateDriveController.getPublicDriveBySlug);

app.post("/create", driveController.createDrive);
app.post("/workflow/create", driveController.createWorkflow);

app.post("/ats", driveController.updateAts);
app.post("/assignment", driveController.updateAssignment);
app.post("/interview", driveController.updateInterview);

app.post("/publish", driveController.publishDrive);

app.post("/advance-workflow", instituteWorkflowController.advanceWorkflow);

app.delete("/:id", driveController.deleteDrive);
app.post("/", driveController.createDrive);

app.get("/:id/candidates", driveController.getCandidatesForDrive);

app.get("/candidate/:id/resume", candidatesController.getResume);
app.get("/candidate/:id", candidatesController.getCandidate);
app.put("/candidate/qualify", candidatesController.qualifyCandidateInCampus);
app.put("/candidate/disqualify", candidatesController.disqualifyCandidateInCampus);
app.put("/candidate/qualify/bulk", candidatesController.bulkQualifyInCampus);
app.put("/candidate/disqualify/bulk", candidatesController.bulkDisqualifyInCampus);
app.get("/:id/applied", driveController.getAppliedDrives);

export default app;
