import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import Details from "./Details";
// import Stub from "./Stub";
import TestCases from "./TestCases";
import QualityGate from "./QualityGate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Delta } from "quill/core";
import { useAuth } from "@clerk/clerk-react";
import ax from "@/config/axios";
import { TestCase } from "@shared-types/Problem";
import Sdsl from "./Sdsl";
import { parseSdsl } from "@/functions/sdsl";

const steps = [
  {
    title: "Step 1",
    description: "Question Details",
  },
  // {
  //   title: "Step ",
  //   description: "Code Stub",
  // },
  {
    title: "Step 2",
    description: "SDSL Code Stub",
  },
  {
    title: "Step 3",
    description: "Test Cases",
  },
  {
    title: "Step 4",
    description: "Quality Gate",
  },
];

const NewProblem = () => {
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const [activeStep, setActiveStep] = useState(1);

  // Details State
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState<Delta>({} as Delta);

  // // Stub State
  // const [functionName, setFunctionName] = useState("");
  // const [returnType, setReturnType] = useState("");
  // const [fnArguments, setFnArguments] = useState<FunctionArg[]>([]);

  // Test Cases State
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Quality Gate State
  const [minimumFiveCases, setMinimumFiveCases] = useState(false);
  const [minimumThreeSampleCases, setMinimumThreeSampleCases] = useState(false);
  const [minimumTwoTags, setMinimumTwoTags] = useState(false);
  const [minimum100Words, setMinimum100Words] = useState(false);

  const [sdsl, setsdsl] = useState("");
  const [variableWithDataType, setVariableWithDataType] = useState<
    {
      name: string;
      type: string;
    }[]
  >([]);

  const { getToken } = useAuth();
  const buildRequestData = () => {
    const axios = ax(getToken);
    const sdslObject = parseSdsl(sdsl).data
    console.log(sdslObject)
    axios
      .post("/problems", {
        title,
        isPrivate,
        difficulty,
        tags,
        description,
        sdslObject ,
        testCases,
        minimumFiveCases,
        minimumThreeSampleCases,
        minimumTwoTags,
        minimum100Words,
      })
      .then(() => {
        toast.success("Problem created successfully");
      })
      .catch(() => {
        toast.error("Error creating problem");
      });
  };

  useEffect(() => {
    const step1Completed =
      title &&
      difficulty &&
      tags.length > 0 &&
      // @ts-expect-error - TODO: Fix this
      description?.ops?.[0]?.insert?.trim();
    setCompleted((prev) => {
      const newCompleted = [...prev];
      newCompleted[0] = !!step1Completed;
      return newCompleted;
    });
  }, [title, difficulty, tags, description]);

  useEffect(() => {
    const step2Completed = sdsl.length > 0;
    setCompleted((prev) => {
      const newCompleted = [...prev];
      newCompleted[1] = !!step2Completed;
      return newCompleted;
    });
  }, [sdsl]);

  useEffect(() => {
    const step4Completed = testCases.length >= 5;
    setCompleted((prev) => {
      const newCompleted = [...prev];
      newCompleted[2] = !!step4Completed;
      return newCompleted;
    });
  }, [testCases]);

  useEffect(() => {
    calculateQualityGate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, difficulty, tags, description, testCases.length]);

  const calculateQualityGate = () => {
    if (testCases.length >= 5) setMinimumFiveCases(true);
    else setMinimumFiveCases(false);

    if (
      testCases.length >= 3 &&
      testCases.filter((i) => i.isSample).length >= 2
    )
      setMinimumThreeSampleCases(true);
    else setMinimumThreeSampleCases(false);

    if (tags.length >= 2) setMinimumTwoTags(true);
    else setMinimumTwoTags(false);

    const statementLength = description?.ops
      ?.map((op) => op?.insert)
      ?.join("")?.length;
    if (statementLength >= 100) setMinimum100Words(true);
    else setMinimum100Words(false);
  };

  //   const handleSubmit = async (e: any) => {
  //     e.preventDefault();

  //     if (true) {
  //       try {
  //         await createProblemMutation.mutate();
  //       } catch (error) {}
  //     }
  //   };
  // };

  // const { getToken } = useAuth();
  // const axios = ax(getToken);

  // const createProblemMutation = useMutation(
  //   () => {
  //     const requestData = buildRequestData();
  //     const response = await axios.post("/problems", requestData);
  //     return response.data;
  //   },
  //   {
  //     onSuccess: (data: any) => {
  //       console.log("Problem created successfully:", data);
  //     },
  //     onError: (error: any) => {
  //       console.error("Error creating problem:", error);
  //     },
  //   }
  // );

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=""
    >
      <div className="h-full w-full flex flex-col">
        <h5>Create a Problem</h5>
        <div className="flex gap-5 mt-5 h-full">
          <Sidebar
            completed={completed}
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
          <Card className="border h-[82.2vh] w-full">
            <CardHeader className="border-b flex justify-between">
              <p>{steps[activeStep - 1]?.description}</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (activeStep === 1)
                      return toast.error("You have reached the start");
                    setActiveStep((prev) => prev - 1);
                  }}
                  variant="flat"
                  isIconOnly
                >
                  <ChevronLeft />
                </Button>
                <Button
                  onClick={() => {
                    if (activeStep === steps.length)
                      return toast.error("You have reached the end");
                    setActiveStep((prev) => prev + 1);
                  }}
                  variant="flat"
                  isIconOnly
                >
                  <ChevronRight />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {activeStep === 1 && (
                <Details
                  {...{
                    title,
                    setTitle,
                    isPrivate,
                    setIsPrivate,
                    difficulty,
                    setDifficulty,
                    tags,
                    setTags,
                    description,
                    setDescription,
                  }}
                />
              )}
              {/* {activeStep === 2 && (
                <Stub
                  {...{
                    functionName,
                    setFunctionName,
                    returnType,
                    setReturnType,
                    fnArguments,
                    setFnArguments,
                  }}
                />
              )} */}
              {activeStep === 2 && (
                <Sdsl
                  {...{
                    sdsl,
                    setsdsl,
                    variableWithDataType,
                    setVariableWithDataType,
                  }}
                />
              )}
              {activeStep === 3 && (
                <TestCases
                  {...{
                    testCases,
                    setTestCases,
                    fnArguments: variableWithDataType,
                  }}
                />
              )}
              {activeStep === 4 && (
                <QualityGate
                  {...{
                    minimumFiveCases,
                    minimumThreeSampleCases,
                    minimumTwoTags,
                    minimum100Words,
                    completed,
                    buildRequestData,
                  }}
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default NewProblem;
