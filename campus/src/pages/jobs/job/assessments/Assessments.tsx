import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Blank from "./Blank";
import Configure from "./Configure";
import Main from "./Main";
import { Posting } from "@shared-types/Posting";

const Assessments = () => {
  const [assessmentsEnabled, setAssessmentsEnabled] = useState(false);
  const [assessmentsConfigured, setAssessmentsConfigured] = useState(false);

  const { posting } = useOutletContext() as { posting: Posting };

  useEffect(() => {
    const noOfAssessments = posting?.workflow?.steps?.filter(
      (step) =>
        step.type === "ca" || step.type === "mcqca" || step.type === "mcqa"
    ).length;

    if (noOfAssessments) {
      setAssessmentsEnabled(true);

      const remainingToConfig = posting?.workflow?.steps?.length
        ? posting?.workflow?.steps?.filter(
            (step) =>
              step.type === "ca" ||
              step.type === "mcqca" ||
              step.type === "mcqa"
          ).length - (posting?.assessments?.length ?? 0)
        : 0;

      if (remainingToConfig) {
        setAssessmentsConfigured(true);
      }
    }
  }, [posting]);

  if (!assessmentsEnabled) {
    return <Blank />;
  }

  if (assessmentsConfigured) {
    return <Configure posting={posting} />;
  }

  return <Main />;
};

export default Assessments;
