import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ReloadIcon } from "@radix-ui/react-icons";

const AddCase = ({
  respondNext,
  data,
  args,
  saving,
}: {
  respondNext: (
    allowed: boolean,
    data:
      | {
          name: string;
          difficulty: string;
          score: number;
          input: string[];
          output: string;
          isSample: boolean;
        }[]
      | null
  ) => void;
  args: { key: string; type: string }[];
  data: {
    name: string;
    difficulty: string;
    score: number;
    input: string[];
    output: string;
    isSample: boolean;
  }[];
  saving: boolean;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState<boolean>(false);

  const [caseName, setCaseName] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [score, setScore] = useState<number>(0);
  const [input, setInput] = useState<string[]>([
    ...Array(args.length).fill(""),
  ]);
  const [output, setOutput] = useState<string>("");
  const [isSample, setIsSample] = useState<boolean>(false);

  const [inputCaseArray, setInputCaseArray] = useState<string>("");
  const [outputCaseArray, setOutputCaseArray] = useState<string>("");

  const [testCases, setTestCases] = useState<
    {
      name: string;
      difficulty: string;
      score: number;
      input: string[];
      output: string;
      isSample: boolean;
    }[]
  >([]);

  useEffect(() => {
    setTestCases(data);
  }, [data]);

  const submitProblem = () => {
    if (verifyFields()) {
      respondNext(true, testCases);
    } else {
      respondNext(false, null);
    }
  };

  const verifyFields = (): boolean => {
    if (testCases.length === 0) {
      return false;
    }
    return true;
  };

  const saveCase = () => {
    if (caseName && difficulty && score && input && output) {
      setTestCases([
        ...testCases,
        {
          name: caseName,
          difficulty,
          score,
          input,
          output,
          isSample,
        },
      ]);
      setOpen(false);
    } else {
      toast.error("Please fill all the fields");
    }
  };

  const parseData = (inputString: string) => {
    inputString = inputString.substring(1, inputString.length - 2);

    const seperatedCases = inputString.split("],[");
    const finalCases: string[] = [];

    seperatedCases.forEach((element) => {
      element = "[" + element + "]";
      let parsedArr = JSON.parse(element);
      parsedArr = parsedArr.map((item: string | number | boolean | object) => {
        if (typeof item === "string") {
          return item;
        } else {
          return JSON.stringify(item);
        }
      });

      return finalCases.push(parsedArr);
    });

    return finalCases;
  };

  const parseOutput = (outputString: string) => {
    let finalStr = JSON.parse(outputString);

    if (finalStr.some((item: unknown) => typeof item === "object")) {
      finalStr = finalStr.map((item: unknown) => {
        if (typeof item === "object") {
          return JSON.stringify(item);
        } else {
          return item;
        }
      });
    }

    return finalStr;
  };

  const bulkAdd = () => {
    const outputArray = parseOutput(outputCaseArray);
    const inputArray = parseData(inputCaseArray);

    console.log("OP");
    console.log(outputArray);

    if (inputArray.length !== outputArray.length) {
      toast.error("Input and Output Array length should be same");
      return;
    }
    const cases = inputArray.map((item, index) => {
      return {
        name: `Case ${index + 1}`,
        difficulty,
        score,
        input: [...item], // Ensure input is always an array
        output: outputArray[index],
        isSample: index < 3 ? true : false,
      };
    });

    setTestCases([...testCases, ...cases]);
    setIsBulkAddOpen(false);
    setInputCaseArray("");
    setOutputCaseArray("");
  };

  const deleteCase = (index: number) => {
    const newCases = testCases.filter((_, i) => i !== index);
    setTestCases(newCases);
  };

  const editCase = (index: number) => {
    const item = testCases[index];
    setCaseName(item.name);
    setDifficulty(item.difficulty);
    setScore(item.score);
    setInput(item.input);
    setOutput(item.output);
    setIsSample(item.isSample);
    deleteCase(index);
    setOpen(true);
  };

  const setCaseArg = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const value = e.target.value;
    const current = [...input];
    current[index] = value;
    setInput(current);
  };

  return (
    <div className=" overflow-y-auto h-[77vh] pr-16">
      <h5>Test Cases</h5>
      <div>
        <div className="flex gap-3">
          <Button className="mt-4" variant="link" onClick={() => setOpen(true)}>
            Add Test Case
          </Button>
          <Button className="mt-4">Import from CSV</Button>
          <Button className="mt-4" onClick={() => setIsBulkAddOpen(true)}>
            {" "}
            Place as Array
          </Button>
        </div>

        <div className="h-[50vh] overflow-y-auto">
          <Table className="w-[70vw] mt-5">
            <TableHeader>
              <TableRow>
                <TableHead>Case No.</TableHead>
                <TableHead>Case Name</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Output</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>isSample</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.input.length > 0
                      ? item.input.map((arg, i) => (
                          <p key={i}>
                            {arg} {i !== item.input.length - 1 ? "," : ""}
                          </p>
                        ))
                      : "No Arguments"}
                  </TableCell>
                  <TableCell>{item.output}</TableCell>
                  <TableCell>{item.difficulty}</TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>{item.isSample ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button variant="link" onClick={() => editCase(index)}>
                      Edit
                    </Button>
                    <Button variant="link" onClick={() => deleteCase(index)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button className="mt-5 float-right" onClick={() => submitProblem()}>
          {saving ? <ReloadIcon className="m-10 w-10 animate-spin" /> : "Next"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Case</DialogTitle>
            <DialogDescription asChild>
              <div>
                <div className="mt-5">
                  <p>
                    Case Name <span className="text-red-500 mt-5">*</span>
                  </p>
                  <Input
                    placeholder="Enter case name"
                    className="mt-3"
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                  />
                </div>
                <div className="flex mt-5 gap-5 justify-center">
                  <div>
                    <p>Difficulty</p>
                    <Select
                      onValueChange={(e: string) => setDifficulty(e)}
                      value={difficulty}
                    >
                      <SelectTrigger className="w-[220px] mt-3">
                        <SelectValue placeholder="easy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p>Score</p>
                    <Input
                      placeholder="Enter score"
                      className="mt-3 w-[220px]"
                      type="number"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-5 mt-5 items-start justify-center">
                  <p>Input</p>
                  {args.length > 0 ? (
                    <>
                      {args.map(
                        (
                          item: {
                            key: string;
                            type: string;
                          },
                          index: number
                        ) => (
                          <div
                            className="flex gap-3 justify-center items-center w-full"
                            key={item.key}
                          >
                            <p>{item.key}</p>
                            <Input
                              placeholder={`Enter ${item.key}`}
                              className="w-full"
                              value={input[index]}
                              onChange={(e) => setCaseArg(e, index)}
                            />
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    "No Arguments Found"
                  )}

                  <div>
                    <p>Output</p>
                    <Textarea
                      className="w-[450px] mt-3"
                      value={output}
                      onChange={(e) => setOutput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Checkbox
                    checked={isSample}
                    disabled={
                      testCases.filter((item) => item.isSample).length >= 3
                    }
                    onCheckedChange={() => setIsSample(!isSample)}
                  />
                  <p>
                    Is a Sample Test Case?{" "}
                    <span className="text-red-500">*</span>
                  </p>
                </div>
              </div>
            </DialogDescription>
            <DialogFooter>
              <Button
                className="mt-5"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button className="mt-5" onClick={saveCase}>
                Save
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Place the Array of cases as plain text here
            </DialogTitle>
            <DialogDescription asChild>
              <div className="">
                <Textarea
                  className="mt-5 h-[100px]"
                  placeholder="Enter Input Array here"
                  value={inputCaseArray}
                  onChange={(e) => setInputCaseArray(e.target.value)}
                />

                <Textarea
                  className="mt-5 h-[100px]"
                  placeholder="Enter Output Array here"
                  value={outputCaseArray}
                  onChange={(e) => setOutputCaseArray(e.target.value)}
                />

                <div className="flex mt-5 gap-5 justify-center">
                  <div>
                    <p>Difficulty</p>
                    <Select
                      onValueChange={(e: string) => setDifficulty(e)}
                      value={difficulty}
                    >
                      <SelectTrigger className="w-[220px] mt-3">
                        <SelectValue placeholder="easy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p>Score</p>
                    <Input
                      placeholder="Enter score"
                      className="mt-3 w-[220px]"
                      type="number"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button className="mt-5 float-right mr-2" onClick={bulkAdd}>
                  Save
                </Button>
                <Button
                  className="mt-5 mr-2 float-right"
                  variant="secondary"
                  onClick={() => setIsBulkAddOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCase;
