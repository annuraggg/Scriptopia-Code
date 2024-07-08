import { Button, useDisclosure } from "@nextui-org/react";
import McqModal from "./McqModal";
import { IMcq } from "@/@types/Assessment";
import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

const Mcqs = ({
  mcqs,
  setMcqs,
}: {
  mcqs: IMcq[];
  setMcqs: (mcqs: IMcq[] | ((prev: IMcq[]) => IMcq[])) => void;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [title, setTitle] = useState("");
  const [questionType, setQuestionType] = useState(
    new Set<string>(["multiple"])
  );

  // MC States
  const [newOption, setNewOption] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctOption, setCorrectOption] = useState<string>("");

  // Checkbox States
  const [newCheckbox, setNewCheckbox] = useState<string>("");
  const [checkboxes, setCheckboxes] = useState<string[]>([]);
  const [correctCheckboxes, setCorrectCheckboxes] = useState<string[]>([]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const addMcq = (
    question: string,
    type: "multiple" | "checkbox" | "text",
    mcq: { options: string[]; correct: string },
    checkbox: { options: string[]; correct: string[] }
  ) => {
    if (isEditing) {
      const newMcqs = [...mcqs];
      newMcqs[editingIndex!] = { question, type, mcq, checkbox };
      setMcqs(newMcqs);
      if (isOpen) onOpenChange();
      clear();
      return;
    }

    setMcqs([...mcqs, { question, type, mcq, checkbox }]);

    clear();
    if (isOpen) onOpenChange();
  };

  const clear = () => {
    setTitle("");
    setQuestionType(new Set<string>(["multiple"]));
    setOptions([]);
    setCorrectOption("");
    setCheckboxes([]);
    setCorrectCheckboxes([]);
    setNewOption("");
    setNewCheckbox("");
    setEditingIndex(null);
    setIsEditing(false);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...mcqs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newQuestions.length) {
      const temp = newQuestions[targetIndex];
      newQuestions[targetIndex] = newQuestions[index];
      newQuestions[index] = temp;
      setMcqs(newQuestions);
    }
  };

  const editQuestion = (editingIndex: number) => {
    setEditingIndex(editingIndex);
    setIsEditing(true);
    setTitle(mcqs[editingIndex!].question);
    setQuestionType(new Set<string>([mcqs[editingIndex!].type]));
    setOptions(mcqs[editingIndex!].mcq.options);
    setCorrectOption(mcqs[editingIndex!].mcq.correct);
    setCheckboxes(mcqs[editingIndex!].checkbox.options);
    setCorrectCheckboxes(mcqs[editingIndex!].checkbox.correct);
    onOpen();
  };

  return (
    <div>
      <div>
        <Button onClick={onOpen}>Add Question</Button>
      </div>
      <McqModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        save={addMcq}
        isEditing={isEditing}
        title={title}
        setTitle={setTitle}
        questionType={questionType}
        setQuestionType={setQuestionType}
        newOption={newOption}
        setNewOption={setNewOption}
        options={options}
        setOptions={setOptions}
        correctOption={correctOption}
        setCorrectOption={setCorrectOption}
        newCheckbox={newCheckbox}
        setNewCheckbox={setNewCheckbox}
        checkboxes={checkboxes}
        setCheckboxes={setCheckboxes}
        correctCheckboxes={correctCheckboxes}
        setCorrectCheckboxes={setCorrectCheckboxes}
      />

      <div>
        {mcqs.map((mcq, i) => (
          <div
            key={i}
            className="flex gap-2 mt-5 border p-5 rounded-xl w-full justify-between"
          >
            <div>
              <h4>{mcq.question}</h4>
              <p className="text-xs">
                {mcq.type === "multiple" && "Multiple Choice"}
                {mcq.type === "checkbox" && "Checkbox"}
              </p>
            </div>

            <div>
              <div className="flex gap-2">
                <Button isIconOnly onClick={() => moveQuestion(i, "up")}>
                  <ChevronUpIcon />
                </Button>
                <Button isIconOnly onClick={() => moveQuestion(i, "down")}>
                  <ChevronDownIcon />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  className="mt-2"
                  color="danger"
                  variant="flat"
                  onClick={() => {
                    setMcqs((prev) => prev.filter((q) => q !== mcq));
                  }}
                  isIconOnly
                >
                  <TrashIcon />
                </Button>
                <Button
                  className="mt-2"
                  color="warning"
                  variant="flat"
                  onClick={() => editQuestion(i)}
                  isIconOnly
                >
                  <PencilIcon />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mcqs;