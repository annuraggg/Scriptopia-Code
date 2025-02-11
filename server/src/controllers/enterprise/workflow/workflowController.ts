// ! FIX THIS FILE
// @ts-nocheck
import Posting from "../../../models/Posting";
import checkPermission from "../../../middlewares/checkOrganizationPermission";
import { sendError, sendSuccess } from "../../../utils/sendResponse";
import { Context } from "hono";
import { Posting as PostingType, WorkflowStep } from "@shared-types/Posting";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { Candidate } from "@shared-types/Candidate";
import { AppliedPosting } from "@shared-types/AppliedPosting";
import loops from "@/config/loops";
import Organization from "@/models/Organization";
import { Assessment } from "@shared-types/Assessment";
import clerkClient from "@/config/clerk";
import { AuditLog, Role } from "@shared-types/Organization";
import CandidateModel from "@/models/Candidate";
const REGION = "ap-south-1";

const advanceWorkflow = async (c: Context) => {
  try {
    const { _id } = await c.req.json();

    const perms = await checkPermission.all(c, ["manage_job"]);
    if (!perms.allowed) {
      return sendError(c, 401, "Unauthorized");
    }

    const posting = await Posting.findById(_id).populate("candidates");
    if (!posting) {
      return sendError(c, 404, "Posting not found");
    }

    const workflow = posting?.workflow;
    if (!workflow) {
      return sendError(c, 400, "No workflow found");
    }

    if (workflow.currentStep >= workflow.steps.length) {
      return sendError(c, 400, "Workflow already completed");
    }

    const newStepIndex = workflow.currentStep + 1;
    workflow.currentStep = newStepIndex;

    if (workflow.steps[newStepIndex].type === "rs")
      await handleResumeScreening(posting as unknown as PostingType);

    if (workflow.steps[newStepIndex].type === "as")
      await handleAssignmentRound(
        posting as unknown as PostingType,
        workflow.steps[newStepIndex] as unknown as WorkflowStep
      );

    console.log(workflow.steps[newStepIndex].type);
    if (
      workflow.steps[newStepIndex].type === "ca" ||
      workflow.steps[newStepIndex].type === "mcqa" ||
      workflow.steps[newStepIndex].type === "mcqca"
    ) {
      await handleAssessmentRound(
        posting as unknown as PostingType,
        workflow.steps[newStepIndex] as unknown as WorkflowStep
      );
    }

    for (const candidate of posting.candidates) {
      const cand = await CandidateModel.findById(candidate._id);
      if (!cand) continue;

      const appliedPosting = cand.appliedPostings.find(
        (ap) => ap.postingId.toString() === posting._id.toString()
      );

      if (!appliedPosting) continue;

      if (appliedPosting.currentStepStatus === "disqualified")
        appliedPosting.status = "rejected";
      else if (appliedPosting.currentStepStatus === "qualified")
        appliedPosting.status = "inprogress";
      appliedPosting.currentStepStatus = "pending";

      await cand.save();
    }

    await posting.save();

    const clerkUser = await clerkClient.users.getUser(c.get("auth").userId);
    const auditLog: AuditLog = {
      user: clerkUser.firstName + " " + clerkUser.lastName,
      userId: clerkUser.id,
      action: `Advanced Workflow for ${posting.title} to step ${newStepIndex}`,
      type: "info",
    };

    const notification = {
      title: "Workflow Advanced",
      description: `Workflow for ${posting.title} has been advanced to step ${workflow.steps[newStepIndex].name}`,
    };

    const organization = await Organization.findById(perms.data!.orgId);
    if (!organization) {
      return sendError(c, 404, "Organization not found");
    }

    for (const member of organization.members) {
      const memberRole = organization.roles.find(
        (role) => role?._id?.toString() == member.role.toString()
      ) as unknown as Role;

      if (!memberRole) continue;
      if (!memberRole.permissions.includes("manage_job")) continue;

      member.notifications.push(notification);
    }

    organization.auditLogs.push(auditLog);
    await organization.save();

    return sendSuccess(c, 200, "Workflow advanced successfully", posting);
  } catch (error) {
    console.error(error);
    return sendError(c, 500, "Internal Server Error", error);
  }
};

const handleResumeScreening = async (posting: PostingType) => {
  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_LAMBDA_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_LAMBDA_SECRET_ACCESS_KEY!,
    },
  });

  const resumes = [];

  for (const candidate of posting.candidates as unknown as Candidate[]) {
    const currentPosting = candidate.appliedPostings.find(
      (ap: AppliedPosting) =>
        ap.postingId.toString() === posting?._id?.toString()
    );

    if (!currentPosting) continue;
    if (currentPosting.currentStepStatus === "disqualified") continue;

    const data = {
      candidateId: candidate?._id?.toString() || "",
      resume: candidate.resumeExtract,
    };

    resumes.push(data);
  }

  const event = {
    jobDescription: posting.description,
    skills: posting?.skills?.join(","),
    negativePrompts: posting?.ats?.negativePrompts?.join(","),
    positivePrompts: posting?.ats?.positivePrompts?.join(","),
    postingId: posting?._id?.toString(),
    resumes: resumes,
  };

  const params = {
    FunctionName: `resume-screener`,
    Payload: JSON.stringify(event),
  };

  lambdaClient.send(new InvokeCommand(params));
  return;
};

const handleAssignmentRound = async (
  posting: PostingType,
  step: WorkflowStep
) => {
  const { name } = step;
  const assignment = posting?.assignments?.find((a) => a.name === name);
  const organization = await Organization.findById(posting.organizationId);

  if (!assignment || !organization || !posting) return;

  const qualifiedCandidates = posting?.candidates?.filter(
    // @ts-expect-error - candidates is not defined in PostingType
    (candidate: Candidate) => {
      const current = candidate.appliedPostings.find(
        (ap: AppliedPosting) =>
          ap.postingId.toString() === posting?._id?.toString()
      );

      if (!current) return false;

      return current.status !== "rejected";
    }
  );

  for (const candidate of qualifiedCandidates as unknown as Candidate[]) {
    loops.sendTransactionalEmail({
      transactionalId: "cm0zk1vd900966e8e6czepc4d",
      email: candidate?.email!,
      dataVariables: {
        name: candidate?.name || "",
        postingName: posting?.title || "",
        company: organization?.name || "",
        assignmentLink: `${process.env.ENTERPRISE_FRONTEND_URL}/postings/${posting?.url}/assignments/${assignment._id}`,
      },
    });
  }
};

const handleAssessmentRound = async (
  posting: PostingType,
  step: WorkflowStep
) => {
  const { type, stepId } = step;

  if (!stepId) return;

  const assessment = posting?.assessments?.find(
    (a) => a.toString() === stepId?.toString()
  );

  const organization = await Organization.findById(posting.organizationId);
  if (!assessment || !organization || !posting) return;

  const qualifiedCandidates = posting?.candidates?.filter(
    // @ts-expect-error - candidates is not defined in PostingType
    (candidate: Candidate) => {
      const current = candidate.appliedPostings.find(
        (ap: AppliedPosting) =>
          ap.postingId.toString() === posting?._id?.toString()
      );

      if (!current) return false;
      return current.status !== "rejected";
    }
  );

  let assessmentType = "";
  if (type === "ca") {
    assessmentType = "Coding";
  }

  if (type === "mcqa") {
    assessmentType = "MCQ";
  }

  if (type === "mcqca") {
    assessmentType = "MCQ + Coding";
  }

  for (const candidate of qualifiedCandidates as unknown as Candidate[]) {
    loops.sendTransactionalEmail({
      transactionalId: "cm16lbamn012iyfq0agp9wl54",
      email: candidate?.email!,
      dataVariables: {
        name: candidate?.name || "",
        postingName: posting?.title || "",
        type: assessmentType,
        assessmentLink: `${process.env.SCRIPTOPIA_FRONTEND_URL}/assessments/${
          (assessment as unknown as Assessment)?._id
        }`,
        company: organization?.name || "",
      },
    });
  }
};

export default {
  advanceWorkflow,
};
