import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DateValue,
  RangeValue,
  Tab,
  Tabs,
  TimeInputValue,
} from "@nextui-org/react";
import { useState, Key } from "react";
import General from "./General";
import Instructions from "./Instructions";
import Security from "./Security";
import Feedback from "./Feedback";
import Mcqs from "../mcq/createmcq/Mcqs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  today,
  getLocalTimeZone,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { useAuth } from "@clerk/clerk-react";
import ax from "@/config/axios";
import { toast } from "sonner";

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: { id: number; text: string; isCorrect: boolean }[];
  maxLimit?: number;
  imageUrl?: string;
  code?: string;
  blankText?: string;
  blanksAnswers?: string[];
}

export type QuestionType =
  | "single-select"
  | "multi-select"
  | "true-false"
  | "short-answer"
  | "long-answer"
  | "fill-in-blanks"
  | "matching"
  | "output"
  | "visual"
  | "peer-review";

interface Section {
  id: number;
  name: string;
  questions: Question[];
  isEditing: boolean;
}

const tabsList = ["General", "MCQs", "Instructions", "Security", "Feedback"];
const New = ({ assessmentName }: { assessmentName: string }) => {
  const [activeTab, setActiveTab] = useState("0");

  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(0);
  const [passingPercentage, setPassingPercentage] = useState(0);
  const [testOpenRange, setTestOpenRange] = useState<RangeValue<DateValue>>({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });
  const [startTime, setStartTime] = useState<TimeInputValue>(
    parseAbsoluteToLocal(new Date().toISOString())
  );
  const [endTime, setEndTime] = useState<TimeInputValue>(
    parseAbsoluteToLocal(new Date().toISOString())
  );

  // MCQs Tab States

  // Instructions Tab States
  const [instructions, setInstructions] = useState("");

  // Security Tab States
  const [codePlayback, setCodePlayback] = useState(false);
  const [tabChangeDetection, setTabChangeDetection] = useState(false);
  const [copyPasteDetection, setCopyPasteDetection] = useState(false);

  // Feedback Tab States
  const [feedbackEmail, setFeedbackEmail] = useState("");

  const isTabValid = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0: // General
        return (
          assessmentDescription.trim() !== "" &&
          timeLimit > 0 &&
          passingPercentage > 0 &&
          testOpenRange.start !== null &&
          testOpenRange.end !== null &&
          startTime !== null &&
          endTime !== null
        );
      case 1: // MCQs
        return sections.some((section) => section.questions.length > 0);
      case 2: // Instructions
        return instructions.trim() !== "";
      case 3: // Security
        return true; // All fields are optional
      case 4: // Feedback
        return feedbackEmail.trim() !== "";
      default:
        return true;
    }
  };

  const handleTabChange = (key: Key) => {
    const currentTabIndex = parseInt(activeTab);
    const newTabIndex = parseInt(key.toString());

    if (newTabIndex > currentTabIndex && !isTabValid(currentTabIndex)) {
      toast.error("Please complete all required fields before proceeding.");
      return;
    }

    setActiveTab(key.toString());
  };

  const { getToken } = useAuth();

  const buildAssessmentData = () => {
    const rangeStart = testOpenRange.start.toDate("UTC");
    const rangeEnd = testOpenRange.end.toDate("UTC");
    rangeStart.setHours(startTime.hour);
    rangeStart.setMinutes(startTime.minute);
    rangeEnd.setHours(endTime.hour);
    rangeEnd.setMinutes(endTime.minute);

    const formattedMcqs = sections.flatMap((section) =>
      section.questions.map((question) => ({
        sectionName: section.name,
        question: question.text,
        type: mapQuestionType(question.type),
        options: question.options,
        grade: 1,
      }))
    );
    const step = window.history.state.usr.step;
    const reqBody = {
      assessmentPostingName: assessmentName,
      postingId: window.location.pathname.split("/")[2],
      name: assessmentName,
      isEnterprise: true,
      step: step,
      description: assessmentDescription,
      type: "mcq",
      timeLimit,
      passingPercentage,
      openRange: { start: rangeStart, end: rangeEnd },
      mcqs: formattedMcqs,
      candidates: {
        type: "all",
      },
      instructions,
      security: {
        codePlayback,
        tabChangeDetection,
        copyPasteDetection,
      },
      feedbackEmail,
    };

    const mapQuestionType = (type: QuestionType): string => {
      switch (type) {
        case "single-select":
          return "multiple";
        case "multi-select":
          return "checkbox";
        default:
          return "multiple";
      }
    };

    const axios = ax(getToken);
    axios
      .post("/postings/assessment", reqBody)
      .then(() => {
        toast.success("Assessment created successfully");
        window.location.href = window.location.pathname
          .split("/")
          .slice(0, -2)
          .join("/");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error creating assessment");
      });
  };

  const tabsComponents = [
    <General
      {...{
        assessmentName,
        assessmentDescription,
        setAssessmentDescription,
        timeLimit,
        setTimeLimit,
        passingPercentage,
        setPassingPercentage,
        testOpenRange,
        setTestOpenRange,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
      }}
    />,
    <Mcqs
      sections={sections}
      setSections={setSections}
      selectedSection={selectedSection}
      setSelectedSection={setSelectedSection}
    />,
    <Instructions {...{ instructions, setInstructions }} />,
    <Security
      {...{
        codePlayback,
        setCodePlayback,
        tabChangeDetection,
        setTabChangeDetection,
        copyPasteDetection,
        setCopyPasteDetection,
      }}
    />,
    <Feedback
      {...{
        feedbackEmail,
        setFeedbackEmail,
        buildAssessmentData,
      }}
    />,
  ];

  return (
    <div className="flex items-center justify-center flex-col relative w-full">
      <Tabs selectedKey={activeTab} onSelectionChange={handleTabChange}>
        {tabsList.map((tabItem, i) => (
          <Tab key={i} title={tabItem} className="w-full">
            <Card className="w-full h-[80vh]">
              <CardHeader className="border-b flex items-center justify-between">
                <p>{tabItem}</p>
                <div className="flex gap-2">
                  <Button
                    variant="shadow"
                    size="sm"
                    isIconOnly
                    onClick={() =>
                      handleTabChange((parseInt(activeTab) - 1).toString())
                    }
                    isDisabled={parseInt(activeTab) === 0}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="shadow"
                    size="sm"
                    isIconOnly
                    onClick={() =>
                      handleTabChange((parseInt(activeTab) + 1).toString())
                    }
                    isDisabled={
                      parseInt(activeTab) === tabsList.length - 1 ||
                      !isTabValid(parseInt(activeTab))
                    }
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="px-10 py-5">{tabsComponents[i]}</CardBody>
            </Card>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default New;
