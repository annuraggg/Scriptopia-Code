import { Hono } from "hono";
import assessmentController from "../controllers/coding/assessmentController";

const app = new Hono();

// app.get("/all/:page", assessmentController.getAssessments);

// app.get("/mcq/created/:page", assessmentController.getMyMcqAssessments);
// app.get("/code/created/:page", assessmentController.getMyCodeAssessments);
// app.get("/mcqcode/created/:page", assessmentController.getMyMcqCodeAssessments);
// app.get("/taken/:page", assessmentController.getTakenAssessments); // !CHANGE

// app.get(
//   "/mcq/created/:page/:enterprise/:postingId",
//   assessmentController.getMyMcqAssessments
// );
// app.get(
//   "/code/created/:page/:enterprise/:postingId",
//   assessmentController.getMyCodeAssessments
// );
// app.get(
//   "/mcqcode/created/:page/:enterprise/:postingId",
//   assessmentController.getMyMcqCodeAssessments
// );

// // app.get("/taken/:page", assessmentController.getMyMcqCodeAssessments); // !CHANGE

// app.get("/:id", assessmentController.getAssessment);
// app.post("/", assessmentController.createAssessment);

// // END OF NEW ROUTES

// app.post("/verify", assessmentController.verifyAccess);
// app.post("/submit", assessmentController.submitAssessment);

// app.get("/view/:id", assessmentController.getAssessmentSubmissions);
// app.get("/view/:id/:postingId", assessmentController.getAssessmentSubmissions);

// app.get(
//   "/view/:id/:submissionId",
//   assessmentController.getAssessmentSubmission
// );
// app.get(
//   "/view/:id/:submissionId/:postingId",
//   assessmentController.getAssessmentSubmission
// );

// app.delete("/mcq/created/:id", assessmentController.deleteAssessment);
// app.delete("/code/created/:id", assessmentController.deleteAssessment);
// app.delete("/mcqcode/created/:id", assessmentController.deleteAssessment);

// app.post("/candidates/qualify", assessmentController.qualifyCandidate);
// app.post("/candidates/disqualify", assessmentController.disqualifyCandidate);


// app.post("/submit/code", assessmentController.codeSubmit);
// app.post("/submit/code/individual", assessmentController.submitIndividualProblem);
// app.post("/submit", assessmentController.submitAssessment);

// Create Routes
app.post("/mcq", assessmentController.createMcqAssessment);
app.post("/code", assessmentController.createCodeAssessment);

// Get User Created Assessments
app.get("/mcq/created", assessmentController.getCreatedMcqAssessments);
app.get("/code/created", assessmentController.getCreatedCodeAssessments);

// Get User Taken Assessments
app.get("/mcq/taken", assessmentController.getTakenMcqAssessments);
app.get("/code/taken", assessmentController.getTakenCodeAssessments);

// Get Routes
app.get("/mcq/:id", assessmentController.getMcqAssessment);
app.get("/code/:id", assessmentController.getCodeAssessment);

// Delete Routes
app.delete("/mcq/:id", assessmentController.deleteMcqAssessment);
app.delete("/code/:id", assessmentController.deleteCodeAssessment);

app.post("/verify", assessmentController.verifyAccess);


app.post("/code/checkProgress", assessmentController.checkCodeProgress);
app.post("/submit/code/individual", assessmentController.submitIndividualProblem);
app.post("/submit/code", assessmentController.codeSubmit);

app.post("/mcq/checkProgress", assessmentController.checkMcqProgress);
app.post("/submit/mcq/individual", assessmentController.submitIndividualProblem);
app.post("/submit/mcq", assessmentController.submitMcqAssessment);



export default app;
