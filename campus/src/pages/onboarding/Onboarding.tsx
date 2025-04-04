import { useState } from "react";
import "./Onboarding.css";
import Info from "./Info";
import Contact from "./Contact";
import Team from "./Team";
import { Button } from "@nextui-org/react";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";
import { setInstitute } from "@/reducers/instituteReducer";
import { useDispatch } from "react-redux";
import ax from "@/config/axios";

interface InvitedMember {
  email: string;
  role: string;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const [instituteName, setInstituteName] = useState<string>("");
  const [instituteEmail, setInstituteEmail] = useState<string>("");
  const [instituteWebsite, setInstituteWebsite] = useState<string>("");
  const [instituteAddress, setInstituteAddress] = useState<string>("");
  const [instituteStreetAddress, setInstituteStreetAddress] = useState<string>("");
  const [instituteCity, setInstituteCity] = useState<string>("");
  const [instituteState, setInstituteState] = useState<string>("");
  const [instituteCountry, setInstituteCountry] = useState<string>("");
  const [instituteZipCode, setInstituteZipCode] = useState<string>("");

  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);

  const [loading, setLoading] = useState(false);

  const steps = [
    {
      name: "Institute Info",
      description: "Tell us about your institute",
      component: (
        <Info
          instituteName={instituteName}
          setInstituteName={setInstituteName}
        />
      ),
    },
    {
      name: "Institute Contact",
      description: "Contact details of your institute",
      component: (
        <Contact
          instituteEmail={instituteEmail}
          setInstituteEmail={setInstituteEmail}
          instituteWebsite={instituteWebsite}
          setInstituteWebsite={setInstituteWebsite}
          instituteAddress={instituteAddress}
          setInstituteAddress={setInstituteAddress}
          instituteStreetAddress={instituteStreetAddress}
          setInstituteStreetAddress={setInstituteStreetAddress}
          instituteCity={instituteCity}
          setInstituteCity={setInstituteCity}
          instituteState={instituteState}
          setInstituteState={setInstituteState}
          instituteCountry={instituteCountry}
          setInstituteCountry={setInstituteCountry}
          instituteZipCode={instituteZipCode}
          setInstituteZipCode={setInstituteZipCode}
        />
      ),
    },
    {
      name: "Team",
      description: "Add your team members",
      component: (
        <Team
          invitedMembers={invitedMembers}
          setInvitedMembers={setInvitedMembers}
          loading={loading}
        />
      ),
    },
  ];

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const websiteRegex = /^(http|https):\/\/[^ "]+$/;

    if (!instituteName || !instituteEmail || !instituteWebsite ||
      !instituteStreetAddress || !instituteCity || !instituteState ||
      !instituteCountry || !instituteZipCode) {
      toast.error("Please fill all fields");
      return false;
    }

    if (!emailRegex.test(instituteEmail)) {
      toast.error("Invalid email");
      return false;
    }

    if (!websiteRegex.test(instituteWebsite)) {
      toast.error("Invalid website");
      return false;
    }

    return true;
  };

  const { getToken } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  const submit = () => {
    if (!validate()) return;

    const axios = ax(getToken);
    setLoading(true);
    axios
      .post("/institutes/create", {
        name: instituteName,
        email: instituteEmail,
        website: instituteWebsite,
        address: {
          street: instituteStreetAddress,
          city: instituteCity,
          state: instituteState,
          country: instituteCountry,
          zipCode: instituteZipCode
        },
        members: invitedMembers,
      })
      .then(() => {
        setLoading(false);
        toast.success("Institute created successfully");
        window.location.href = "/dashboard";
        const data = {
          _id: user?.publicMetadata?.instituteId,
          role: user?.publicMetadata?.roleName,
          permissions: user?.publicMetadata?.permissions,
        };
        dispatch(setInstitute(data));
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error(
          err.response.data.message || "Failed to create institute"
        );
      });
  };

  return (
    <div className="flex items-center justify-center h-screen p-10 py-5">
      <div className="min-w-[60%] h-full pr-10 overflow-auto">
        <img src="logo.png" alt="logo" className="w-14 h-14" />
        <div className="flex gap-3 mt-10">
          {steps.map((_s, i) => (
            <div
              className={`w-14 h-3 rounded-full transition-colors
              ${currentStep === i
                  ? "bg-success-200"
                  : currentStep > i
                    ? "bg-success-300"
                    : "bg-gray-700 opacity-50"
                }
              `}
            ></div>
          ))}
        </div>
        <p className="mt-3 opacity-50">
          {currentStep + 1} of {steps.length}
        </p>

        <div className="mt-5 h-[65%]">{steps[currentStep].component}</div>

        <div className="flex items-center gap-3 justify-end self-end">
          <Button
            onClick={() => setCurrentStep(currentStep - 1)}
            color="default"
            isDisabled={currentStep === 0 || loading}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (currentStep === steps.length - 1) {
                submit();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            color="success"
            isLoading={loading}
          >
            {currentStep === steps.length - 1 ? "Continue" : "Next"}
          </Button>
        </div>
      </div>
      <div className="container h-full w-full rounded-3xl mix-blend-difference"></div>
    </div>
  );
};

export default Onboarding;