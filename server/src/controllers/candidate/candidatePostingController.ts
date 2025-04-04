import { Context } from "hono";
import { sendError, sendSuccess } from "@/utils/sendResponse";
import logger from "@/utils/logger";
import Posting from "@/models/Posting";
import Organization from "@/models/Organization";
import { Posting as IPosting } from "@shared-types/Posting";
import {
  Organization as IOrganization,
  Department,
} from "@shared-types/Organization";
import { ExtendedPosting } from "@shared-types/ExtendedPosting";

interface OrgPostings extends Omit<IOrganization, "postings"> {
  postings: IPosting[];
}

const getPublicPostings = async (c: Context) => {
  try {
    const organizations = (await Organization.find()
      .populate("postings")
      .lean()) as unknown as OrgPostings[];
    const activePosting: ExtendedPosting[] = [];
    organizations.forEach((org: OrgPostings) => {
      org.postings.forEach((posting) => {
        if (posting?.published) {
          activePosting.push({
            ...posting,
            department: org?.departments?.find(
              (dept: Department) =>
                dept?._id?.toString() === posting?.department?.toString()
            )?.name, // @ts-expect-error
            organizationId: {
              name: org?.name,
              logo: org?.logo || "",
            },
          });
        }
      });
    });
    return sendSuccess(c, 200, "Postings fetched successfully", activePosting);
  } catch (e: any) {
    console.error(e);
    return sendError(c, 500, "Something went wrong");
  }
};

const getPublicPostingBySlug = async (c: Context) => {
  try {
    const posting = await Posting.findOne({
      url: c.req.param("url"),
      published: true,
      "applicationRange.end": { $gt: new Date() },
    })
      .populate<{ organizationId: IOrganization }>(
        "organizationId",
        "name logo description departments"
      )
      .populate<{ department: Department }>("department", "name")
      .lean();

    if (!posting) {
      return sendError(c, 404, "Job posting not found");
    }

    const formattedPosting = {
      _id: posting._id,
      title: posting.title,
      description: posting.description,
      department: posting.department,
      location: posting.location,
      type: posting.type,
      salary: posting.salary,
      openings: posting.openings,
      skills: posting.skills,
      publishedOn: posting.publishedOn,
      applicationRange: posting.applicationRange,
      organization: posting.organizationId
        ? {
            name: posting.organizationId.name,
            logo: posting.organizationId.logo || "",
          }
        : null,
    };

    return sendSuccess(
      c,
      200,
      "Posting fetched successfully",
      formattedPosting
    );
  } catch (e: any) {
    logger.error(e);
    return sendError(c, 500, "Something went wrong");
  }
};

export default {
  getPublicPostings,
  getPublicPostingBySlug,
};
