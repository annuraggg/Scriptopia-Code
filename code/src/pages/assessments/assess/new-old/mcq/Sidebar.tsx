import { Button, Card, CardBody, Progress } from "@nextui-org/react";
import { useState } from "react";
import { MCQAssessment as MA } from "@shared-types/MCQAssessment";

interface SidebarProps {
  timer: number;
  assessment: MA;
}

const Sidebar = ({ timer, assessment }: SidebarProps) => {
  // @ts-expect-error
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "Section 1",
    },
    {
      id: 2,
      title: "Section 2",
    },
    {
      id: 3,
      title: "Section 3",
    },
  ]);
  const [currentSection, setCurrentSection] = useState(sections[0]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="min-h-full w-[20%] overflow-y-auto">
      <div className="sticky p-5">
        <Button color="success" variant="flat" className="mb-3 w-full">
          Submit Assessment
        </Button>
        <Progress value={50} label="Progress" />
        <p className="mt-5 text-center">Time Left: {formatTime(timer)}</p>
      </div>

      <CardBody className="h-full">
        <div>
          {sections.map((section) => (
            <div
              key={section.id}
              className={`mt-2 bg-card border-2 py-4 px-5 rounded-xl cursor-pointer transition-colors
                ${
                  currentSection.id === section.id
                    ? "bg-foreground-100"
                    : "hover:bg-foreground-100 bg-opacity-50"
                }
                `}
              onClick={() => setCurrentSection(section)}
            >
              <p>{section.title}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default Sidebar;
