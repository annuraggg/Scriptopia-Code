import { Button, Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  name: string;
  author: string;
  description: string;
  tags: string[];
}

const Questions = ({
  availableQuestions,
  setAvailableQuestions,
  selectedQuestions,
  setSelectedQuestions,
}: {
  availableQuestions: Question[];
  setAvailableQuestions: (
    questions: Question[] | ((prev: Question[]) => Question[])
  ) => void;
  selectedQuestions: Question[];
  setSelectedQuestions: (
    questions: Question[] | ((prev: Question[]) => Question[])
  ) => void;

}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...selectedQuestions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newQuestions.length) {
      const temp = newQuestions[targetIndex];
      newQuestions[targetIndex] = newQuestions[index];
      newQuestions[index] = temp;
      setSelectedQuestions(newQuestions);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button onClick={() => setSheetOpen(true)} variant="flat">
          Add Question
        </Button>
      </motion.div>

      <div className="flex flex-col gap-4 mt-5">
        <AnimatePresence>
          {selectedQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>{question.name}</CardHeader>
                <CardBody>
                  <div className="flex gap-5 items-center">
                    <div className="min-w-12 min-h-12 rounded-full flex items-center justify-center border text-center">
                      {index + 1}
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {question.description}
                      </p>
                      <div className="flex gap-2 flex-wrap mt-5 text-xs line-clamp-1 text-ellipsis h-7">
                        {question.tags.map((tag) => (
                          <Chip key={tag} className="text-xs" size="sm">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          onClick={() => moveQuestion(index, "up")}
                        >
                          <ChevronUpIcon />
                        </Button>
                        <Button
                          isIconOnly
                          onClick={() => moveQuestion(index, "down")}
                        >
                          <ChevronDownIcon />
                        </Button>
                      </div>
                      <Button
                        className="mt-2 w-full"
                        color="danger"
                        variant="flat"
                        onClick={() => {
                          setSelectedQuestions((prev) =>
                            prev.filter((q) => q.id !== question.id)
                          );
                          setAvailableQuestions((prev) =>
                            prev.concat(question)
                          );
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="min-w-[500px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Select a Question</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-5">
            {availableQuestions.map((question) => (
              <Card key={question.id} className="w-full">
                <CardHeader>{question.name}</CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {question.description}
                  </p>
                  <div className="flex gap-2 flex-wrap mt-5 text-xs line-clamp-1 text-ellipsis h-7 justify-center">
                    {question.tags.map((tag) => (
                      <Chip key={tag} className="text-xs" size="sm">
                        {tag}
                      </Chip>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="flat" className="w-full mt-2">
                      View
                    </Button>
                    <Button
                      variant="flat"
                      className="w-full mt-2"
                      color="success"
                      onClick={() => {
                        setSelectedQuestions((prev) => [...prev, question]);
                        setAvailableQuestions((prev) =>
                          prev.filter((q) => q.id !== question.id)
                        );
                        setSheetOpen(false);
                      }}
                    >
                      Add Question
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Questions;
