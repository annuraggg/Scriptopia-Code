import { useState, useEffect } from "react";
import { 
    Card, 
    Button, 
    Input,
    CardHeader,
    CardFooter,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, Save } from "lucide-react";

interface Section {
  id: number;
  name: string;
  isEditing: boolean;
}

interface McqSidebarProps {
  onSectionSelect: (section: Section) => void;
  selectedSectionId: number | null;
}

const McqSidebar = ({ onSectionSelect, selectedSectionId }: McqSidebarProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSections, setOriginalSections] = useState<Section[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sectionsChanged = JSON.stringify(sections) !== JSON.stringify(originalSections);
    setHasChanges(sectionsChanged);
  }, [sections, originalSections]);

  const handleAddSection = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSectionName.trim()) {
      const newSection = {
        id: Date.now(),
        name: newSectionName,
        isEditing: false
      };
      setSections([...sections, newSection]);
      setNewSectionName("");
      setIsAddingNew(false);
    }
  };

  const handleDeleteSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const startEditing = (id: number) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isEditing: true } : section
    ));
  };

  const handleEdit = (id: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newName = (e.target as HTMLInputElement).value.trim();
      if (newName) {
        setSections(sections.map(section => 
          section.id === id ? { ...section, name: newName, isEditing: false } : section
        ));
      }
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setOriginalSections([...sections]);
    setHasChanges(false);
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleSectionClick = (section: Section) => {
    if (!section.isEditing) {
      onSectionSelect(section);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-[20%] h-full"
    >
      <Card className="h-full rounded-xl">
        <CardHeader className="flex flex-col items-start px-4 pt-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Sections</h3>
            <span className="text-xs text-gray-500">({sections.length})</span>
          </div>
          <p className="text-sm text-gray-500">Manage your MCQ sections</p>
        </CardHeader>
        <div className="p-4 pt-2 space-y-2 overflow-y-auto flex-grow">
          {sections.map((section) => (
            <Card
              key={section.id}
              isHoverable
              isPressable
              className={`w-full h-10 flex items-center justify-center px-3 cursor-pointer ${
                selectedSectionId === section.id ? 'bg-primary/10' : ''
              }`}
              onClick={() => handleSectionClick(section)}
            >
              {section.isEditing ? (
                <Input
                  defaultValue={section.name}
                  className="w-full"
                  size="sm"
                  onKeyDown={(e) => handleEdit(section.id, e)}
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="overflow-hidden">
                    <div className={`text-sm whitespace-nowrap ${
                      section.name.length > 20 ? 'animate-marquee' : ''
                    }`}>
                      {section.name}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(section.id);
                      }}
                      className="p-1 hover:bg-zinc-500 rounded-full transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="p-1 hover:bg-zinc-500 rounded-full transition-colors text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
          
          {isAddingNew ? (
            <Card className="w-full h-10 flex items-center justify-center px-3">
              <Input
                placeholder="Enter section name and press Enter"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={handleAddSection}
                size="sm"
                autoFocus
                className="w-full"
              />
            </Card>
          ) : (
            <Button
              onClick={() => setIsAddingNew(true)}
              size="sm"
              className="w-full"
              startContent={<Plus size={16} />}
            >
              Add Section
            </Button>
          )}
        </div>
        <CardFooter className="justify-end px-4 pb-4">
          <Button
            color="primary"
            size="sm"
            startContent={<Save size={16} />}
            className={`transition-all duration-300 ${
              hasChanges 
                ? 'opacity-100 hover:shadow-glow-primary'
                : isSaving 
                  ? 'shadow-glow-primary' 
                  : 'opacity-50'
            }`}
            onClick={handleSave}
            isDisabled={!hasChanges}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default McqSidebar;