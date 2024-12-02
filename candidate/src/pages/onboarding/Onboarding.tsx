import { useState } from "react";
import "./Onboarding.css";
import Info from "./Info";
import Contact from "./Contact";
import { Button } from "@nextui-org/react";
import { CalendarDate } from "@internationalized/date";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";
import ax from "@/config/axios";
import Address from "./Address";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const [name, setName] = useState<string>("");
  const [dob, setDob] = useState<CalendarDate | undefined>();
  const [gender, setGender] = useState<string>("");

  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [address, setAddress] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const steps = [
    {
      name: "Candidate Info",
      description: "Tell us about your organization",
      component: (
        <Info
          name={name}
          setName={setName}
          dob={dob}
          setDob={setDob}
          gender={gender}
          setGender={setGender}
        />
      ),
    },
    {
      name: "Candidate Contact",
      description: "Contact details of yourself",
      component: (
        <Contact
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
        />
      ),
    },
    {
      name: "Address",
      description: "Tell us about your address",
      component: <Address address={address} setAddress={setAddress} />,
    },
  ];

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !dob || gender === "") {
      toast.error("Please fill in all fields");
      return false;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!phone) {
      toast.error("Please enter a phone number");
      return false;
    }

    if (!address) {
      toast.error("Please enter your address");
      return false;
    }

    return true;
  };

  const { getToken } = useAuth();

  const submit = () => {
    if (!validate()) return;

    const axios = ax(getToken);
    setLoading(true);
    axios
      .post("/candidates/candidate", {
        name,
        dob: dob?.toDate("UTC"),
        gender,
        email,
        phone,
        address,
      })
      .then(() => {
        setLoading(false);
        toast.success("Profile Created successfully");
        window.location.href = "/dashboard";
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error(err.response.data.message || "Failed to create profile");
      });
  };

  return (
    <div className="flex items-center justify-center h-screen p-10">
      <div className="min-w-[60%] h-full pr-10">
        <img src="logo.png" alt="logo" className="w-14 h-14" />
        <div className="flex gap-3 mt-10">
          {steps.map((_s, i) => (
            <div
              className={`w-14 h-3 rounded-full transition-colors
              ${
                currentStep === i
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

        <div className="h-[65%]">{steps[currentStep].component}</div>

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