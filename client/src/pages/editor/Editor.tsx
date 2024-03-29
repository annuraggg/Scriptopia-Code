import Split from "react-split";
import { Navbar } from "@/components/ui/navbar";
import ProblemStatement from "./ProblemStatement";
import CodeEditor from "./CodeEditor";
import Descriptor from "./Descriptor";
import { useEffect, useState } from "react";
import Meta from "@/types/ProblemMeta";
import { Case } from "@/types/TestCase";
import axios from "axios";
import returnStarter from "@/components/StarterGenerator";
import JSConfetti from "js-confetti";
import SuccessDrawer from "./SuccessDrawer";
import { toast } from "sonner";
import Explain from "./Explain";

function App() {
  const [statement, setStatement] = useState<any>({});
  const [meta, setMeta] = useState<Meta>({} as Meta);
  const [code, setCode] = useState<string>("");
  const [cases, setCases] = useState<Case[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [vars, setVars] = useState<any>({});
  const [fn, setFn] = useState<string>("");
  const [output, setOutput] = useState<any>("" as any);

  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState<number>(0);

  const [bgOverlay, setBgOverlay] = useState(0);
  const jsConfetti = new JSConfetti();

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [memoryUsed, setMemoryUsed] = useState<number>(0);

  const [openSheet, setOpenSheet] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [explainResponse, setExplainResponse] = useState("");
  const [explainCodeStr, setExplainCodeStr] = useState<string>("");
  const [sheetError, setSheetError] = useState(false);

  useEffect(() => {
    const probId = window.location.pathname.split("/").pop();
    axios
      .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/problems/${probId}`)
      .then((res) => {
        const response = res.data;
        setStatement(response.desc);
        setMeta(response.meta);
        setCases(response.cases);
        setFn(response.func);
        const starter = returnStarter(
          "javascript",
          response.func,
          response.args
        );
        setCode(starter);
        setVars(response.args);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong!");
      });
  }, []);

  const runCode = async (code: string, language: string) => {
    setRunning(true);
    let err = false;
    await axios
      .post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/compiler/run`,
        {
          code,
          language,
          cases,
          fn,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setConsoleOutput(res.data.output.consoleOP);
        setOutput(res.data.output);
        setRuns((prev) => prev + 1);
      })
      .catch((err) => {
        console.log(err);
        err = true;
      })
      .finally(() => {
        setRunning(false);
      });

    return new Promise((_resolve, reject) => {
      if (err) {
        reject("Something went wrong!");
      } else {
        _resolve("");
      }
    });
  };

  const submitCode = async (code: string, language: string) => {
    setRunning(true);
    let err = false;
    await axios
      .post(
        `${import.meta.env.VITE_BACKEND_ADDRESS}/compiler/submit`,
        {
          code,
          language,
          cases,
          fn,
          probID: meta.id,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setConsoleOutput(res.data.output.consoleOP);
        setOutput(res.data.output);
        setRuns((prev) => prev + 1);
        if (
          res.data.output.internalStatus === "PASSED" &&
          res.data.output.failedCaseNumber === -1
        ) {
          setSubmitSuccess(true);
          setTimeTaken(res.data.output.runtime);
          setMemoryUsed(res.data.output.memoryUsage);
          jsConfetti.addConfetti();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong!");
        err = true;
      })
      .finally(() => {
        setRunning(false);
      });

    return new Promise((_resolve, reject) => {
      if (err) {
        reject("Something went wrong!");
      } else {
        _resolve("");
      }
    });
  };

  const explainCode = async (value: string) => {
    setSheetLoading(true);
    setOpenSheet(true);
    setExplainCodeStr(value);

    axios
      .post(`${import.meta.env.VITE_BACKEND_ADDRESS}/compiler/explain`, {
        code: value,
      })
      .then((res) => {
        setExplainResponse(res.data.response);
      })
      .catch((err) => {
        toast.error("Something went wrong!");
        console.error(err.response.data.message);
        setSheetError(true);
      })
      .finally(() => {
        setSheetLoading(false);
      });
  };

  const setOpenValue = (val: boolean) => {
    setOpenSheet(val);
  };

  useEffect(() => {
    if (
      runs > 0 &&
      running === false &&
      cases[0]?.output !== undefined &&
      cases[1]?.output !== undefined &&
      cases[2]?.output !== undefined
    ) {
      if (
        cases[0]?.output === output.output[0] &&
        cases[1]?.output === output.output[1] &&
        cases[2]?.output === output.output[2]
      ) {
        setBgOverlay(1);
      } else {
        setBgOverlay(2);
      }
    } else if (running === true) {
      setBgOverlay(0);
    }
  }, [output, runs, running, cases]);

  return (
    <div vaul-drawer-wrapper="">
      <div
        className={` ${
          !running ? "opacity-100" : "opacity-0"
        } flex items-center justify-center text-white text-2xl font-bold transition-all duration-500 ease-in-out h-[100vh] absolute w-full`}
        style={{
          background:
            bgOverlay === 1
              ? "radial-gradient(circle, rgba(1,45,9,1) 0%, rgba(2,8,23,1) 100%)"
              : bgOverlay === 2
              ? " radial-gradient(circle, rgba(45,1,1,1) 0%, rgba(2,8,23,1) 100%)"
              : "radial-gradient(circle, rgba(13,15,0,1) 0%, rgba(2,8,23,1) 100%)",
        }}
      ></div>
      <Navbar />

      <div
        className={`flex gap-5 px-5 h-[90vh] overflow-y-auto flex-col md:flex-row`}
      >
        <ProblemStatement statement={statement} meta={meta} />
        <Split
          className="md:w-[50%] w-[100%] h-[90vh] split"
          direction="vertical"
        >
          <CodeEditor
            runCode={runCode}
            code={code}
            submitCode={submitCode}
            explainCode={explainCode}
          />
          <Descriptor
            cases={cases}
            consoleOutput={consoleOutput}
            running={running}
            runs={runs}
            vars={vars}
            output={output.output}
          />
        </Split>
      </div>
      {submitSuccess && (
        <SuccessDrawer memoryUsed={memoryUsed} timeTaken={timeTaken} />
      )}
      <Explain
        open={openSheet}
        setOpen={setOpenValue}
        code={explainCodeStr}
        responseStr={explainResponse}
        loading={sheetLoading}
        err={sheetError}
      />
    </div>
  );
}
export default App;
