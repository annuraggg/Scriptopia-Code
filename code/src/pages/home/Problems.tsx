import { Problem } from "@shared-types/Problem";
import { Input, Select, SelectItem } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

const Problems = ({
  problems,
  tags,
  solvedProblems,
}: {
  problems: Problem[];
  tags: string[];
  solvedProblems: string[];
}) => {
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

  const [filteredProblems, setFilteredProblems] = React.useState<Problem[]>(
    []
  );

  useEffect(() => {
    // filter problems
    if (problems) {
      const filteredProblems = problems.filter((problem) => {
        if (difficulty && problem.difficulty !== difficulty) return false;
        if (
          search &&
          !problem.title.toLowerCase().includes(search.toLowerCase())
        )
          return false;

        if (selectedTag && !problem.tags.includes(selectedTag.toLowerCase())) return false;
        return true;
      });
      setFilteredProblems(filteredProblems);
    }
  }, [difficulty, search, problems, selectedTag]);

  return (
    <div className="fixed left-3 md:static">
      <h6 className="text-md md:text-md mt-4 md:mt-2 text-gray-500 mb-5">
        Problems
      </h6>
      <div className="flex gap-5 line-clamp-1 flex-wrap h-5 w-[100%] md:block">
        {tags?.map((tag, i) => (
          <div
            className="hover:text-blue-500 duration-200 transition-colors cursor-pointer text-sm"
            key={i}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </div>
        ))}
      </div>
      <div className="md:mt-5 flex flex-col md:flex-row gap-3 w-full">
        <Input
          type="Search"
          label="Search Problems"
          size="sm"
          className="w-[45vh] md:w-[70%]"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <div className="flex flex-row items-center flex-wrap md:w-[30%] md:gap-0 md:justify-center gap-4">
          <Select
            label="Difficulty"
            className=" w-[30%] md:flex-grow md:ml-4"
            size="sm"
            selectedKeys={[difficulty]}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <SelectItem key="easy" value="easy">
              Easy
            </SelectItem>
            <SelectItem key="medium" value="medium">
              Medium
            </SelectItem>
            <SelectItem key="hard" value="hard">
              Hard
            </SelectItem>
          </Select>
        </div>
      </div>

      <div className="mt-3 md:mt-5 overflow-x-auto md:overflow-x-visible w-[45vh] md:w-[100%]">
        <Table isStriped aria-label="Problems" className="min-w-full">
          <TableHeader>
            <TableColumn className="text-sm">Problem</TableColumn>
            <TableColumn className="text-sm">Difficulty</TableColumn>
            <TableColumn className="text-sm">Tags</TableColumn>
            <TableColumn className="text-sm">Status</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredProblems?.map((problem: Problem) => (
              <TableRow className="h-14" key={problem.title}>
                <TableCell
                  className="w-full md:w-auto hover:text-blue-500 cursor-pointer"
                  onClick={() => navigate(`/problems/${problem._id}`)}
                >
                  <p className="truncate max-w-[500px]">{problem.title}</p>
                </TableCell>
                <TableCell
                  className={`
              ${problem.difficulty.toLowerCase() === "easy" && "text-green-400"}
              ${problem.difficulty.toLowerCase() === "medium" &&
                    "text-yellow-400"
                    }
              ${problem.difficulty.toLowerCase() === "hard" && "text-red-400"}
            `}
                >
                  {problem.difficulty.slice(0, 1).toUpperCase() +
                    problem.difficulty.slice(1)}
                </TableCell>
                <TableCell className="w-full md:w-auto">
                  <p className="truncate max-w-[250px]">
                    {problem.tags.join(", ")}
                  </p>
                </TableCell>
                <TableCell>
                  {solvedProblems?.find(
                    (solvedProblem) => solvedProblem === problem._id
                  )
                    ? "Solved"
                    : "Not Solved"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Problems;
