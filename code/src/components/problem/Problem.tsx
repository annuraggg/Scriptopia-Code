import { useState } from "react";
import Editor from "./Editor/Editor";
import InfoPanel from "./InfoPanel";
import Statement from "./LeftPanel/Statement";
import Split from "@uiw/react-split";
import ax from "@/config/axios";
import { RunResponseResult } from "@shared-types/RunResponse";
import confetti from "canvas-confetti";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button, Card, CardBody } from "@nextui-org/react";
import { CpuIcon, TimerIcon } from "lucide-react";
import { Submission } from "@shared-types/Submission";
import { useAuth } from "@clerk/clerk-react";
import defaultLanguages from "@/data/languages";
import { Problem as ProblemType } from "@shared-types/Problem";
import { Delta } from "quill/core";

const Problem = ({
  loading,
  problem,
  submissions,
  setSubmissions,
  defaultLanguage = "javascript",
  languages = defaultLanguages,

  allowRun = true,
  allowSubmissionsTab = true,
  allowSubmit = true,
  allowExplain = true,

  submitOverride,
}: {
  loading: boolean;
  problem: ProblemType;
  submissions?: Submission[];
  setSubmissions?: (submissions: Submission[]) => void;
  defaultLanguage?: string;
  languages?: { name: string; abbr: string; available: boolean }[];

  allowRun?: boolean;
  allowSubmissionsTab?: boolean;
  allowSubmit?: boolean;
  allowExplain?: boolean;

  submitOverride?: (code: string, language: string, problemId: string) => void;
}) => {
  const { getToken } = useAuth();
  const axios = ax(getToken);

  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>(defaultLanguage);

  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [outputCases, setOutputCases] = useState<RunResponseResult[]>([]);
  const [codeError, setCodeError] = useState<string>("");
  const [runningCode, setRunningCode] = useState<boolean>(false);
  const [currentSub, setCurrentSub] = useState<Submission | null>(null);

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const [leftPaneActTab, setLeftPaneActTab] = useState<string>("statement");

  const [componentLoading, setComponentLoading] = useState<boolean>(false);

  const runCode = async () => {
    setRunningCode(true);
    return axios
      .post("/submissions/run", { code, language, problemId: problem._id })
      .then((res) => {
        setOutputCases(
          res.data.data.results.filter((r: { isSample: boolean }) => r.isSample)
        );

        const firstError = res.data.data.results.find(
          (r: RunResponseResult) => r.error?.name && r.error?.message
        );

        let firstErrorFull = "";
        if (firstError)
          firstErrorFull = `${firstError.error.name}: ${firstError.error.message}`;

        setCodeError(firstErrorFull);

        const consoleOp = res.data.data.results
          .map((r: RunResponseResult) => r.consoleOutput?.join("\n"))
          .join("\n");

        setConsoleOutput(consoleOp || "");

        if (res.data.data.STATUS === "ERROR") {
          setCodeError(res.data.data.message);
        }

        return { success: true, error: "", data: {} };
      })
      .catch((err) => {
        return { success: false, error: err, data: {} };
      })
      .finally(() => {
        setRunningCode(false);
      });
  };

  const submitCode = async () => {
    if (submitOverride) {
      submitOverride(code, language, problem._id);
      return new Promise<object>((resolve) =>
        resolve({ success: true, error: "", data: {} })
      );
    }

    setRunningCode(true);
    setComponentLoading(true);

    return axios
      .post("/submissions/submit", { code, language, problemId: problem._id })
      .then((res) => {
        setOutputCases(
          res.data.data.results.filter((r: { isSample: boolean }) => r.isSample)
        );

        const firstError = res.data.data.results.find(
          (r: RunResponseResult) => r.error?.name && r.error?.message
        );

        let firstErrorFull = "";
        if (firstError)
          firstErrorFull = `${firstError.error.name}: ${firstError.error.message}`;

        setCodeError(firstErrorFull);

        const consoleOp = res.data.data.results
          .map((r: RunResponseResult) => r.consoleOutput?.join("\n"))
          .join("\n");

        setConsoleOutput(consoleOp || "");
        setComponentLoading(false);

        if (res.data.data.status === "FAILED") {
          runConfetti("error");
        } else {
          runConfetti("success");
        }

        setDrawerOpen(true);
        setLeftPaneActTab("submissions");
        const newSubmissions = [...(submissions || [])];
        newSubmissions.unshift(res.data.data);
        if (setSubmissions) {
          setSubmissions(newSubmissions || []);
        }
        setCurrentSub(res.data.data);
        return { success: true, error: "", data: {} };
      })
      .catch((err) => {
        setComponentLoading(false);
        console.log(err);
        return { success: false, error: err, data: {} };
      })
      .finally(() => setRunningCode(false));
  };

  const runConfetti = (type: "success" | "error") => {
    const end = Date.now() + 500;

    const successColors = ["#052814", "#12A150"];
    const errorColors = ["#8B0000", "#FF0000"];

    (function frame() {
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 100,
        origin: { x: 0 },
        colors: type === "success" ? successColors : errorColors,
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 100,
        origin: { x: 1 },
        colors: type === "success" ? successColors : errorColors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Split className="flex h-[90vh] w-full gap-2" vaul-drawer-wrapper="">
        <Statement
          statement={problem.description as Delta}
          submissions={submissions || []}
          title={problem.title}
          setActiveTab={setLeftPaneActTab}
          activeTab={leftPaneActTab}
          loading={componentLoading}
          allowSubmissionsTab={allowSubmissionsTab}
        />
        <Split mode="vertical" className="w-full">
          <Editor
            runCode={runCode}
            submitCode={submitCode}
            loading={componentLoading}
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            languages={languages}
            allowRun={allowRun}
            allowExplain={allowExplain}
            allowSubmit={allowSubmit}
          />
          <InfoPanel
            consoleOutput={consoleOutput}
            runningCode={runningCode}
            codeError={codeError}
            cases={outputCases}
          />
        </Split>
      </Split>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <DrawerContent className="outline-none">
          <DrawerHeader>
            <DrawerTitle>Solution Submitted</DrawerTitle>
            <DrawerDescription>
              Submitted at {new Date().toLocaleString()}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex gap-5 items-center justify-center">
            <Card className="px-10 py-5">
              <CardBody>
                <div className="flex gap-5 items-center">
                  <TimerIcon size={30} />
                  <div>
                    <h5>Time Taken</h5>
                    <p>{currentSub?.avgTime.toFixed(2)} ms</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="px-10 py-5">
              <CardBody>
                <div className="flex gap-5 items-center">
                  <CpuIcon size={30} />
                  <div>
                    <h5>Memory Used</h5>
                    <p>{((currentSub?.avgMemory || 0) * 1000).toFixed(2)} KB</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                className="w-fit mx-auto"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Problem;
