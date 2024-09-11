import loops from "@/config/loops";
import r2Client from "@/config/s3";
import Candidate from "@/models/Candidate";
import Organization from "@/models/Organization";
import Otp from "@/models/Otp";
import Posting from "@/models/Posting";
import logger from "@/utils/logger";
import { sendError, sendSuccess } from "@/utils/sendResponse";
import { Upload } from "@aws-sdk/lib-storage";
import { Context } from "hono";

const getPosting = async (c: Context) => {
  const { url } = c.req.param();
  try {
    const posting = await Posting.findOne({ url: url });
    const organization = await Organization.findOne({
      _id: posting?.organizationId,
      published: true,
    });

    return sendSuccess(c, 200, "Posting fetched successfully", {
      postings: posting,
      organization,
    });
  } catch (e: any) {
    logger.error(e);
    return sendError(c, 500, "Something went wrong");
  }
};

const sendVerificationMail = async (c: Context) => {
  const { email } = await c.req.json();
  const otp = Math.floor(100000 + Math.random() * 900000);
  const identifierKey = Math.random().toString(36).substring(7);
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  const cand = await Candidate.findOne({ email });
  let exists = false;
  let candId = "";
  if (cand) {
    exists = true;
    candId = cand._id.toString();
  }

  try {
    await loops.sendTransactionalEmail({
      transactionalId: "cm0wpse9a01hox6359mu40yq9",
      email: email,
      dataVariables: {
        otp: otp,
      },
    });

    await Otp.create({
      email,
      identifierKey,
      expiry,
      otp,
    });

    return sendSuccess(c, 200, "Verification mail sent successfully", {
      identifierKey,
      exists,
      candId,
    });
  } catch (e: any) {
    logger.error(e);
    return sendError(c, 500, "Something went wrong");
  }
};

const verifyOtp = async (c: Context) => {
  const { email, identifierKey, otp } = await c.req.json();
  console.log(email, identifierKey, otp);
  const otpDoc = await Otp.findOne({ email, identifierKey });
  const candidate = await Candidate.findOne({ email });
  let exists = false;
  let firstName = "";
  let lastName = "";
  let countryCode = "";
  let phone = "";
  let website = "";

  if (candidate) {
    exists = true;
    firstName = candidate.firstName;
    lastName = candidate.lastName;
    countryCode = candidate.phone.slice(0, 3);
    phone = candidate.phone.slice(3);
    website = candidate.website || "";
  }

  if (!otpDoc) {
    return sendError(c, 404, "Otp not found");
  }

  if (otpDoc.otp != otp) {
    return sendError(c, 400, "Invalid otp");
  }

  Otp.findOneAndDelete({ email, identifierKey });

  return sendSuccess(c, 200, "Otp verified successfully", {
    exists,
    firstName,
    lastName,
    countryCode,
    phone,
    website,
  });
};

const getCandidate = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const candidate = await Candidate.findOne({ userId: id });
    let exists = false;
    let candId = "";

    if (!candidate) {
      return sendSuccess(c, 200, "Candidate not found", { exists, candId });
    }

    let firstName = candidate.firstName;
    let lastName = candidate.lastName;
    let countryCode = candidate.phone.slice(0, 3);
    let phone = candidate.phone.slice(3);
    let website = candidate.website || "";
    exists = true;
    candId = candidate._id.toString();
    return sendSuccess(c, 200, "Candidate fetched successfully", {
      exists,
      firstName,
      lastName,
      countryCode,
      phone,
      website,
      candId,
      posted: candidate.appliedPostings,
    });
  } catch (e: any) {
    logger.error(e);
    return sendError(c, 500, "Something went wrong");
  }
};

const apply = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const countryCode = formData.get("countryCode");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const website = formData.get("website");
    const query = formData.get("query");
    const resume = formData.get("resume");
    const postingId = formData.get("postingId");
    const exists = formData.get("exists") === "true";
    const candId = formData.get("candId");
    const userId = formData.get("userId");

    let finalCandId: string = candId?.toString() || "";

    if (exists) {
      const candidate = await Candidate.findById(candId);
      if (!candidate) {
        return sendError(c, 404, "Candidate not found");
      }

      if (
        candidate.appliedPostings.some(
          (posting) => posting.postingId.toString() === postingId
        )
      ) {
        return sendError(c, 400, "You have already applied for this posting");
      }

      candidate.firstName = firstName?.toString() || candidate.firstName;
      candidate.lastName = lastName?.toString() || candidate.lastName;
      candidate.phone =
        `${countryCode?.toString()}${phone?.toString()}` || candidate.phone;
      candidate.website = website?.toString() || candidate.website;
      candidate.email = email?.toString() || candidate.email;

      candidate.appliedPostings.push({
        postingId: postingId,
        queries: query,
      });

      await candidate.save();
    }

    if (!exists) {
      const cand = await Candidate.findOne({ email });
      if (cand) {
        return sendError(c, 400, "Candidate with this email already exists");
      }

      if (!resume) {
        return sendError(c, 400, "Resume file is required");
      }

      const candidate = new Candidate({
        firstName,
        lastName,
        email,
        phone: `${countryCode}${phone}`,
        website,
        userId,
      });

      candidate.appliedPostings.push({
        postingId: postingId,
        queries: query,
      });

      await candidate.save();
      finalCandId = candidate._id.toString();
    }

    const uploadParams = {
      Bucket: process.env.R2_S3_BUCKET!,
      Key: `resumes/${finalCandId?.toString()}`,
      Body: resume, // @ts-expect-error - Type 'File' is not assignable to type 'Body'
      ContentType: resume.type,
    };

    const upload = new Upload({
      client: r2Client, // @ts-expect-error - Type 'S3Client' is not assignable to type 'Client'
      params: uploadParams,
    });

    await upload.done();
    console.log("Resume uploaded");
    console.log(finalCandId);

    await Candidate.findByIdAndUpdate(finalCandId, {
      resumeUrl: `https://${process.env.R2_S3_BUCKET}.s3.amazonaws.com/resumes/${finalCandId}`,
    });

    return sendSuccess(c, 200, "Application submitted successfully");
  } catch (e: any) {
    console.error(e);
    return sendError(c, 500, "Something went wrong");
  }
};

export default {
  getPosting,
  sendVerificationMail,
  verifyOtp,
  apply,
  getCandidate,
};
