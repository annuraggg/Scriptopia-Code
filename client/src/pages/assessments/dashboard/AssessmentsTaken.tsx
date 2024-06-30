import { motion } from "framer-motion";
import { Card, CardBody, CardHeader, Input } from "@nextui-org/react";

interface TakenAssessment {
  name: string;
  date: string;
  duration: number;
}

interface TakenAssessmentListProps {
  takenAssessments: TakenAssessment[];
}

const AssessmentsTaken = ({takenAssessments}: TakenAssessmentListProps) => {
  return (
    <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="w-full p-10 h-[90vh]"
  >
    <div className="">
      <div>
        <Input placeholder="Search Assessments" />
      </div>
      <div className="mt-5 flex gap-5 flex-wrap">
        {takenAssessments.map((TakenAssessment) => (
          <Card className="w-[32%]">
            <CardHeader>{TakenAssessment.name}</CardHeader>
            <CardBody>
              <p className="text-xs text-gray-500">Date: {TakenAssessment.date}</p>
              <p className="text-xs text-gray-500">
                Duration: {TakenAssessment.duration} minutes
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
    </motion.div>
  );
};

export default AssessmentsTaken;
