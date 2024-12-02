// CreateJob.tsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import JobDetails from "./JobDetails";
import Workflow from "./Workflow";
import { DateValue, RangeValue } from "@nextui-org/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import Summary from "./Summary";
import { useAuth } from "@clerk/clerk-react";
import ax from "@/config/axios";
import { Posting } from "@shared-types/Posting";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import AdditionalDetails from "./AdditionalDetails";
import { useNavigate, useOutletContext } from "react-router-dom";
import { RootContext } from "@/types/RootContext";

interface Component {
  icon: React.ElementType;
  label: string;
  name: string;
  id: string;
}

const componentMap = {
  ATS: "rs",
  "MCQ Assessment": "mcqa",
  "Code Assessment": "ca",
  "MCQ + Code Assessment": "mcqca",
  Assignment: "as",
  Interview: "pi",
};

const CreateJob = () => {
  const [active, setActive] = useState(0);

  // Job Details States
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [openings, setOpenings] = useState<number>(0);
  const [applicationRange, setApplicationRange] = useState<
    RangeValue<DateValue>
  >({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });
  const [currency, setCurrency] = useState<string>("");
  const [minSalary, setMinSalary] = useState<number>(0);
  const [maxSalary, setMaxSalary] = useState<number>(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");

  // Additional Details States
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [allowNoEntries, setAllowNoEntries] = useState<string[]>([]);

  // Workflow States
  const [addedComponents, setAddedComponents] = useState<Component[]>([]);

  const { getToken } = useAuth();
  const axios = ax(getToken);
  const [loading, setLoading] = useState(false);
  const { organization, setOrganization } = useOutletContext() as RootContext;
  const navigate = useNavigate();

  const handleSave = () => {
    setLoading(true);

    const formattedData = {
      steps: addedComponents.map((component) => ({
        name: component.label, // @ts-ignore
        type: componentMap[component.label] as
          | "rs"
          | "mcqa"
          | "ca"
          | "mcqca"
          | "as"
          | "pi"
          | "cu",
      })),
      currentStep: -1,
    };

    const posting: Posting = {
      title,
      description,
      department,
      location,
      type: category as
        | "full_time"
        | "part_time"
        | "internship"
        | "contract"
        | "temporary",
      openings,

      applicationRange: {
        start: applicationRange.start.toString(),
        end: applicationRange.end.toString(),
      },
      skills,
      salary: {
        min: minSalary,
        max: maxSalary,
        currency,
      },
      workflow: formattedData,
    };

    axios
      .post("/postings", posting)
      .then((res) => {
        toast.success("Job created successfully");
        const newOrganization = { ...organization };
        newOrganization.postings.push(res.data.data);
        setOrganization(newOrganization);
        navigate("/jobs");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to create job");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) return <Loader />;

  return (
    <div className="flex gap-5 h-screen">
      <Sidebar active={active} setActive={setActive} />
      <div className="float-right overflow-y-auto w-full px-10 py-10">
        {active === 0 && (
          <JobDetails
            setAction={setActive}
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
            department={department}
            setDepartment={setDepartment}
            openings={openings}
            setOpenings={setOpenings}
            applicationRange={applicationRange}
            setApplicationRange={setApplicationRange}
            currency={currency}
            setCurrency={setCurrency}
            minSalary={minSalary}
            setMinSalary={setMinSalary}
            maxSalary={maxSalary}
            setMaxSalary={setMaxSalary}
            skills={skills}
            setSkills={setSkills}
            description={description}
            setDescription={setDescription}
            location={location}
            setLocation={setLocation}
          />
        )}
        {active === 1 && (
          <AdditionalDetails
            setAction={setActive}
            required={requiredFields}
            onRequiredChange={setRequiredFields}
            allowedEmpty={allowNoEntries}
            onAllowedEmptyChange={setAllowNoEntries}
          />
        )}
        {active === 2 && (
          <Workflow
            setAction={setActive}
            addedComponents={addedComponents}
            setAddedComponents={setAddedComponents}
          />
        )}
        {active === 3 && (
          <Summary
            setAction={setActive}
            title={title}
            category={category}
            department={department}
            openings={openings}
            applicationRange={applicationRange}
            currency={currency}
            minSalary={minSalary}
            maxSalary={maxSalary}
            skills={skills}
            description={description}
            addedComponents={addedComponents}
            location={location}
            handleSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};

export default CreateJob;