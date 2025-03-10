import { Input, Select, SelectItem } from "@heroui/react";
import { motion } from "framer-motion";
import { Problem } from "@shared-types/Problem";
import {
  Problem as ProblemAssessment,
  TestCases,
} from "@shared-types/Assessment";

const Grading = ({
  gradingMetric,
  setGradingMetric,
  selectedQuestions,
  testCaseGrading,
  setTestCaseGrading,
  questionsGrading,
  setQuestionsGrading,
}: {
  gradingMetric: string;
  setGradingMetric: (gradingMetric: string) => void;
  selectedQuestions: Problem[];
  testCaseGrading: TestCases;
  setTestCaseGrading: (testCaseGrading: TestCases) => void;
  questionsGrading: ProblemAssessment[];
  setQuestionsGrading: (
    questionsGrading:
      | ProblemAssessment[]
      | ((prev: ProblemAssessment[]) => ProblemAssessment[])
  ) => void;
}) => {
  if (selectedQuestions.length === 0) return "No Problems Selected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4>Grading Metrics</h4>
      <Select
        label="Grading Metric"
        size="sm"
        className="w-[400px] mt-5"
        selectedKeys={[gradingMetric]}
        onChange={(e) => setGradingMetric(e.target.value)}
      >
        <SelectItem key="testcase" value="testcase">
          By Test Case Difficulty
        </SelectItem>
        <SelectItem key="questions" value="questions">
          By Questions
        </SelectItem>
      </Select>

      <div className="mt-5">
        {gradingMetric === "testcase" && (
          <div>
            <p className="text-sm text-gray-400 mb-16">
              Evaluate Candidates based on how many test cases they pass and how
              difficult each test case is.
            </p>

            <Input
              type="number"
              label="Score for Easy Test Cases"
              className="w-[200px] mb-10"
              endContent={<div>pts.</div>}
              labelPlacement="outside"
              placeholder="score"
              value={testCaseGrading?.easy?.toString()}
              onChange={(e) =>
                setTestCaseGrading({
                  ...testCaseGrading,
                  easy: parseInt(e?.target?.value),
                })
              }
            />
            <Input
              type="number"
              label="Score for Medium Test Cases"
              className="w-[200px] mb-10"
              endContent={<div>pts.</div>}
              labelPlacement="outside"
              placeholder="score"
              value={testCaseGrading?.medium?.toString()}
              onChange={(e) =>
                setTestCaseGrading({
                  ...testCaseGrading,
                  medium: parseInt(e.target.value),
                })
              }
            />
            <Input
              type="number"
              label="Score for Hard Test Cases"
              className="w-[200px]"
              endContent={<div>pts.</div>}
              labelPlacement="outside"
              placeholder="score"
              value={testCaseGrading?.hard?.toString()}
              onChange={(e) =>
                setTestCaseGrading({
                  ...testCaseGrading,
                  hard: parseInt(e.target.value),
                })
              }
            />
          </div>
        )}

        {gradingMetric === "questions" && (
          <div>
            <p className="text-sm text-gray-400 mb-5">
              Evaluate Candidates based on the number of questions they answer.
            </p>
            <div className="flex gap-5 flex-wrap items-center">
              {selectedQuestions.map((question) => (
                <div key={question._id} className="w-[200px]">
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {question.title}
                  </p>
                  <Input
                    type="number"
                    label="Score"
                    className="w-[200px] mb-10 pt-2"
                    endContent={<div>pts.</div>}
                    labelPlacement="outside"
                    placeholder="score"
                    value={questionsGrading
                      .find((q) => q.problemId === question._id)
                      ?.points?.toString()}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      // @ts-expect-error - TS doesn't know that the value is a number
                      setQuestionsGrading((prev) => {
                        const exists = prev.find(
                          (q) => q.problemId === question._id
                        );
                        if (exists) {
                          return prev.map((q) =>
                            q.problemId === question._id
                              ? { ...q, points: value }
                              : q
                          );
                        }
                        return [
                          ...prev,
                          {
                            problemId: question._id,
                            points: value,
                          },
                        ];
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Grading;
