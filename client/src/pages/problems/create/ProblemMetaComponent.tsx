import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css";

const ProblemMetaComponent = ({
  getMeta,
  goBack,
  data,
}: {
  getMeta: Function;
  goBack: Function;
  data: {
    title: string;
    difficulty: string;
    tags: string[];
    functionName: string;
    args: { key: string; type: string }[];
  } | null;
}) => {
  const [title, setTitle] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [functionName, setFunctionName] = useState<string>("");
  const [args, setArgs] = useState<{ key: string; type: string }[]>([]);

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDifficulty(data.difficulty);
      setTags(data.tags);
      setFunctionName(data.functionName);
      setArgs(data.args);
    }
  }, [data]);

  const handleChange = (tags: string[]) => {
    setTags(tags);
  };

  const addArg = () => {
    setArgs([...args, { key: "", type: "" }]);
  };

  const handleSave = () => {
    getMeta({
      title,
      difficulty,
      tags,
      functionName,
      args,
    });
  };

  return (
    <>
      <div className="h-full w-[50vw] rounded-lg p-5 overflow-y-auto">
        <p>Problem Title</p>
        <Input
          placeholder="Title"
          className="mt-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex mt-5 gap-5">
          <div>
            <p className="mb-3">Difficulty</p>
            <Select onValueChange={(e) => setDifficulty(e)} value={difficulty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Difficuly" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-3">Tags</p>
            <div>
              <TagsInput value={tags} onChange={handleChange} />
              <em className="text-xs">
                Press enter to add a tag. Click on a tag to remove it.
              </em>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p>Function Name</p>
          <sub>
            The name of the function to be implemented in the code editor
          </sub>
          <Input
            placeholder="Function Name"
            className="mt-3"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
          />
        </div>
        <div className="mt-5">
          <p>Function Arguments</p>
          <sub>
            The arguments of the function to be implemented in the code editor
            (in key Name Datatype pair)
          </sub>
          <br />
          <div className="mt-3">
            {args.map((arg, idx) => (
              <div className="flex gap-5 mt-3" key={idx}>
                <Input
                  placeholder="Key"
                  value={arg.key}
                  onChange={(e) => {
                    const newArgs = [...args];
                    newArgs[idx].key = e.target.value;
                    setArgs(newArgs);
                  }}
                />
                <Select
                  onValueChange={(e) => {
                    const newArgs = [...args];
                    newArgs[idx].type = e;
                    setArgs(newArgs);
                  }}
                  value={arg.type}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Datatype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button variant="link" className="mt-3" onClick={addArg}>
            Add Argument
          </Button>
        </div>
      </div>
      <div className="flex gap-5">
        <Button onClick={() => goBack(1)}>&lt; Problem Statement</Button>
        <Button onClick={handleSave}>&gt; Test Cases</Button>
      </div>
    </>
  );
};

export default ProblemMetaComponent;
