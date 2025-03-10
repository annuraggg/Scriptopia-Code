import { useEffect, useState } from "react";
import Blank from "./Blank";
import Main from "./Main";
import { useOutletContext } from "react-router-dom";
import Configure from "./Configure";
import { Posting } from "@shared-types/Posting";
import InProgressComp from "./InProgress";

const Ats = () => {
  const [atsEnabled, setAtsEnabled] = useState(false);
  const [atsConfigured, setAtsConfigured] = useState(false);
  const [InProgress, setInProgress] = useState(false);

  const { posting } = useOutletContext() as { posting: Posting };
  console.log(posting);
  useEffect(() => {
    const noOfAts = posting?.workflow?.steps?.filter(
      (step) => step.type === "RESUME_SCREENING"
    ).length;

    if (noOfAts) {
      setAtsEnabled(true);

      const ats = posting?.ats;
      if (ats) {
        setInProgress(ats.status === "processing");
        setAtsConfigured(true);
      }
    }
  }, [posting]);

  if (!atsEnabled) {
    return <Blank />;
  }

  if (!atsConfigured) {
    return <Configure />;
  }

  if (InProgress) {
    return <InProgressComp />;
  }

  return <Main posting={posting} />;
};

export default Ats;
