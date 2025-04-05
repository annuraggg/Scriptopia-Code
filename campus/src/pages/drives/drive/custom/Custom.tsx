import { ExtendedDrive } from "@shared-types/ExtendedDrive";
import { WorkflowStep } from "@shared-types/Drive";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import DataTable from "./DataTable";

interface OutletContext {
  drive: ExtendedDrive;
  active: string;
  refetch: () => void;
}

const Custom = () => {
  const { drive, active } = useOutletContext<OutletContext>();
  const [step, setStep] = useState<WorkflowStep | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);

  useEffect(() => {
    const stepId = window.location.pathname.split("/").pop();
    const step = drive.workflow?.steps?.find((s) => s._id === stepId);
    const isCurrent =
      drive?.workflow?.steps?.find((s) => s._id === stepId)?.status ===
      "in-progress";

    if (step) {
      setStep(step);
      setIsCurrent(isCurrent);
    }
  }, [active]);


  if (!isCurrent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h4 className="text-2xl font-semibold">This Step is Not Currently Active.</h4>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h4>{step?.name}</h4>
      <DataTable data={drive?.candidates} />
    </div>
  );
};

export default Custom;
