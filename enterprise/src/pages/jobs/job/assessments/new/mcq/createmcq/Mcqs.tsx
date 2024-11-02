import { motion } from "framer-motion";
import McqSidebar from "./McqSidebar";
import McqContent from "./McqContent";
import { Section, Question } from "../../../../../../../types/mcq.types";


interface ExtendedMcqProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  selectedSection: Section | null;
  setSelectedSection: (section: Section | null) => void;
  sectionQuestions: {
    [sectionId: number]: Question[];
  };
  onAddQuestion: (sectionId: number, question: Question) => void;
  onUpdateQuestion: (sectionId: number, question: Question) => void;
  onDeleteQuestion: (sectionId: number, questionId: number) => void;
}

const Mcqs: React.FC<ExtendedMcqProps> = ({
  sections,
  setSections,
  selectedSection,
  setSelectedSection,
  sectionQuestions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-row gap-2 w-full h-full overflow-hidden"
    >
      <McqSidebar
        sections={sections}
        setSections={setSections}
        onSectionSelect={handleSectionSelect}
        selectedSectionId={selectedSection?.id ?? null}
      />
      <McqContent 
        selectedSection={selectedSection}
        questions={selectedSection ? sectionQuestions[selectedSection.id] || [] : []}
        onAddQuestion={(question) => {
          if (selectedSection) {
            onAddQuestion(selectedSection.id, question);
          }
        }}
        onUpdateQuestion={(question) => {
          if (selectedSection) {
            onUpdateQuestion(selectedSection.id, question);
          }
        }}
        onDeleteQuestion={(questionId) => {
          if (selectedSection) {
            onDeleteQuestion(selectedSection.id, questionId);
          }
        }}
      />
    </motion.div>
  );
};

export default Mcqs;