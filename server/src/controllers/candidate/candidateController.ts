import r2Client from "@/config/s3";
import AppliedPosting from "@/models/AppliedPosting";
import Candidate from "@/models/Candidate";
import Organization from "@/models/Organization";
import Posting from "@/models/Posting";
import logger from "@/utils/logger";
import { sendError, sendSuccess } from "@/utils/sendResponse";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { AuditLog } from "@shared-types/Organization";
import { Context } from "hono";
import { PDFExtract } from "pdf.js-extract";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getCandidate = async (c: Context) => {
  try {
    const auth = c.get("auth");

    if (!auth) {
      return sendError(c, 401, "Unauthorized");
    }

    const candidate = await Candidate.findOne({ userId: auth._id });

    if (!candidate) {
      return sendError(c, 404, "Candidate not found");
    }

    return sendSuccess(c, 200, "Candidate Profile", candidate);
  } catch (error) {
    logger.error(error as string);
    return sendError(c, 500, "Internal Server Error");
  }
};

const createCandidate = async (c: Context) => {
  try {
    const auth = c.get("auth");
    const body = await c.req.json();

    if (!auth) {
      return sendError(c, 401, "Unauthorized");
    }

    console.log(auth);
    const candidate = await Candidate.findOne({ userId: auth._id });

    if (candidate) {
      return sendError(c, 400, "Candidate already exists");
    }

    const newCandidate = new Candidate({
      ...body,
      userId: auth._id,
    });

    await newCandidate.save();

    return sendSuccess(c, 201, "Candidate Profile Created", newCandidate);
  } catch (error) {
    logger.error(error as string);
    return sendError(c, 500, "Internal Server Error");
  }
};

const updateCandidate = async (c: Context) => {
  try {
    const auth = c.get("auth");
    const body = await c.req.json();

    if (!auth) {
      return sendError(c, 401, "Unauthorized");
    }

    const candidate = await Candidate.findOne({ userId: auth._id });

    if (!candidate) {
      return sendError(c, 404, "Candidate not found");
    }

    const newCandidate = await Candidate.findOneAndUpdate(
      { userId: auth._id },
      { $set: body },
      { new: true }
    );

    return sendSuccess(c, 200, "Candidate Profile Updated", newCandidate);
  } catch (error) {
    logger.error(error as string);
    return sendError(c, 500, "Internal Server Error");
  }
};

const updateResume = async (c: Context) => {
  try {
    const auth = c.get("auth");

    if (!auth) {
      return sendError(c, 401, "Unauthorized");
    }

    const candidate = await Candidate.findOne({ userId: auth._id });

    if (!candidate) {
      return sendError(c, 404, "Candidate not found");
    }

    const formData = await c.req.formData();
    const resume = formData.get("resume");

    if (!resume) {
      return sendError(c, 400, "No file found");
    }

    const uploadParams = {
      Bucket: process.env.R2_S3_RESUME_BUCKET!,
      Key: `${auth._id}.pdf`,
      Body: resume, // @ts-expect-error - Type 'File' is not assignable to type 'Body'
      ContentType: resume.type,
    };

    const upload = new Upload({
      client: r2Client,
      params: uploadParams,
    });

    await upload.done();

    candidate.resumeUrl = `${process.env.R2_S3_RESUME_BUCKET}/${auth._id}.pdf`;
    await candidate.save();

    return sendSuccess(c, 200, "Resume uploaded successfully", {
      url: candidate.resumeUrl,
    });
  } catch (error) {
    logger.error(error as string);
    return sendError(c, 500, "Internal Server Error");
  }
};

const getResume = async (c: Context) => {
  try {
    const auth = c.get("auth");

    if (!auth) {
      return sendError(c, 401, "Unauthorized");
    }

    const candidate = await Candidate.findOne({ userId: auth._id });

    if (!candidate) {
      return sendError(c, 404, "Candidate not found");
    }

    // fetch resume from s3 and send it as a response

    const command = new GetObjectCommand({
      Bucket: process.env.R2_S3_RESUME_BUCKET!,
      Key: `${auth._id}.pdf`,
    });

    // @ts-expect-error - Type 'Promise<GetObjectOutput>' is not assignable to type 'string'
    const url = await getSignedUrl(r2Client, command, { expiresIn: 600 });

    return sendSuccess(c, 200, "Resume URL", { url });
  } catch (error) {
    logger.error(error as string);
    return sendError(c, 500, "Internal Server Error");
  }
};

const apply = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const resume = formData.get("resume");
    const postingId = formData.get("postingId");

    const userId = c.get("auth")?._id;

    const candidate = await Candidate.findOne({ userId });
    const candId = candidate?._id;

    const posting = await Posting.findById(postingId);
    if (!posting) {
      return sendError(c, 404, "Posting not found");
    }

    const today = new Date();
    if (
      today < posting?.applicationRange?.start! ||
      today > posting?.applicationRange?.end!
    ) {
      return sendError(c, 400, "Posting is closed for applications");
    }

    const appliedPosting = await AppliedPosting.create({
      posting: postingId,
      user: candId,
    });

    if (resume) {
      const uploadParams = {
        Bucket: process.env.R2_S3_RESUME_BUCKET!,
        Key: `${candId?.toString()}.pdf`,
        Body: resume, // @ts-expect-error - Type 'File' is not assignable to type 'Body'
        ContentType: resume.type,
      };

      const upload = new Upload({
        client: r2Client,
        params: uploadParams,
      });

      await upload.done();

      appliedPosting.resumeUrl = `${
        process.env.R2_S3_RESUME_BUCKET
      }/${candId?.toString()}.pdf`;
      await extractTextFromResume(
        resume as File,
        appliedPosting._id?.toString()
      );
      await appliedPosting.save();

      await Candidate.findByIdAndUpdate(candId, {
        $push: {
          appliedPostings: appliedPosting._id,
        },
      });
    }
    const postingUp = await Posting.findByIdAndUpdate(postingId, {
      $push: {
        candidates: candId,
      },
    });

    await postingUp?.save();

    const auditLog: AuditLog = {
      user: "System",
      userId: "system",
      action: `Received application for ${posting.title}`,
      type: "info",
    };

    await Organization.findByIdAndUpdate(posting.organizationId, {
      $push: { auditLogs: auditLog },
    });

    return sendSuccess(c, 200, "Application submitted successfully");
  } catch (e: any) {
    console.error(e);
    return sendError(c, 500, "Something went wrong");
  }
};

const extractTextFromResume = async (resume: File, candidateId: string) => {
  const resumeBuffer = Buffer.from(await resume.arrayBuffer());
  const pdfExtract = new PDFExtract();
  const options = {}; /* see below */

  let extractedText = "";

  pdfExtract.extractBuffer(resumeBuffer, options, async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    if (!data) {
      return extractedText;
    }

    for (const page of data.pages) {
      for (const content of page.content) {
        extractedText += content.str + " ";
      }
    }

    await AppliedPosting.findByIdAndUpdate(candidateId, {
      resumeExtract: extractedText,
    });

    return extractedText;
  });

  return extractedText;
};

export default {
  getCandidate,
  createCandidate,
  updateResume,
  updateCandidate,
  apply,
  getResume,
};
