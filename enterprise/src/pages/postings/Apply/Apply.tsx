import { useState, useEffect } from "react";
import ContactInfo from "./ContactInfo";
import Resume from "./Resume";
import AdditionalQuestions from "./AdditionalQuestions";
import Review from "./Review";
import {
  Card,
  Progress,
  Button,
} from "@nextui-org/react";

import {
  CircleUserIcon,
  FileTextIcon,
  CircleHelpIcon,
  ScanSearchIcon
} from "lucide-react";

interface StepCard {
  step: string;
  title: string;
  icon: JSX.Element;
  component: React.ReactNode;
}

const Apply = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleEdit = (section: string) => {
    let newStep: number;
    switch(section) {
      case "contact":
        newStep = 0;
        break;
      case "resume":
        newStep = 1;
        break;
      case "additional":
        newStep = 2;
        break;
      default:
        newStep = currentStep;
    }
    setCurrentStep(newStep);
    setCompletedSteps(prevSteps => prevSteps.filter(step => step <= newStep));
  };

  const cards: StepCard[] = [
    {
      step: "Step 1",
      title: "Contact Info",
      icon: <CircleUserIcon size={24} />,
      component: <ContactInfo />,
    },
    {
      step: "Step 2",
      title: "Resume",
      icon: <FileTextIcon size={24} />,
      component: <Resume />,
    },
    {
      step: "Step 3",
      title: "Additional Query",
      icon: <CircleHelpIcon size={24} />,
      component: <AdditionalQuestions />,
    },
    {
      step: "Step 4",
      title: "Review",
      icon: <ScanSearchIcon size={24} />,
      component: <Review onEdit={handleEdit} />,
    }
  ];

  useEffect(() => {
    setCompletedSteps([0]);
  }, []);

  const handleCardClick = (index: number) => {
    if (index <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(index);
    }
  };

  const handleNextClick = () => {
    if (currentStep < cards.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCompletedSteps(prevSteps => {
        if (!prevSteps.includes(nextStep)) {
          return [...prevSteps, nextStep];
        }
        return prevSteps;
      });
    }
  };

  const isStepCompleted = (index: number) => completedSteps.includes(index);
  const isStepActive = (index: number) => index === currentStep;

  const progressValue = ((completedSteps.length) / cards.length) * 100;

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-between h-screen w-[65%] p-16">
        <div className="flex flex-row w-full items-center justify-center">
          <div className="flex flex-col items-start justify-between gap-2 w-full">
            <p className="text-neutral-400">Step {currentStep + 1} of {cards.length}</p>
            <Progress
              aria-label="Application Progress"
              size="md"
              value={progressValue}
              color="success"
              className="max-w-xl"
            />
          </div>
          <Button 
            variant="flat" 
            className="bg-green-500 bg-opacity-20 text-green-500"
            onClick={handleNextClick}
            disabled={currentStep === cards.length - 1}
          >
            Next
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-10 w-full">
          {cards.map((card, index) => (
            <Card
              isPressable={true}
              key={index}
              className={`rounded-xl flex items-start justify-center w-full h-26 p-4 gap-6 cursor-pointer transition-colors duration-300 ${
                isStepCompleted(index) 
                  ? 'bg-green-600 bg-opacity-20 text-green-500'
                  : isStepActive(index)
                  ? 'bg-blue-600 bg-opacity-20 text-blue-500'
                  : ''
              }`}
              onPress={() => handleCardClick(index)}
            >
              <h1 className={`text-sm font-bold ${
                isStepCompleted(index) 
                  ? 'text-green-500' 
                  : isStepActive(index)
                  ? 'text-blue-500'
                  : 'text-slate-500'
              }`}>
                {card.step}
              </h1>
              <div className="flex flex-row items-center justify-center gap-2">
                {card.icon}
                <p className="">{card.title}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex h-screen w-full items-center justify-center mt-10 rounded-xl">
          {cards[currentStep].component}
        </div>
      </div>
    </div>
  );
};

export default Apply;