import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableColumn,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Pagination } from "@heroui/pagination";

import { ChevronRight } from "lucide-react";

// Import types
import { MCQAssessment } from "@shared-types/MCQAssessment";
import { MCQAssessmentSubmission } from "@shared-types/MCQAssessmentSubmission";
import { useNavigate } from "react-router-dom";

interface ResultProps {
  submissions: MCQAssessmentSubmission[];
  assessment: MCQAssessment;
}

const Result = ({ assessment, submissions }: ResultProps) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const router = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Status Badge
  const renderStatusBadge = (status: string | undefined) => {
    if (status === "completed") {
      return (
        <Badge color="success" variant="flat">
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge color="warning" variant="flat">
          In Progress
        </Badge>
      );
    }
  };

  // Cheating Status Badge
  const renderCheatingBadge = (status: string | undefined) => {
    if (status === "No Copying") {
      return (
        <Badge color="success" variant="flat">
          No Copying
        </Badge>
      );
    } else if (status === "Light Copying") {
      return (
        <Badge color="warning" variant="flat">
          Light Copying
        </Badge>
      );
    } else if (status === "Heavy Copying") {
      return (
        <Badge color="danger" variant="flat">
          Heavy Copying
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      <Table
        aria-label="Candidate results table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(submissions.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>CANDIDATE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>SCORE</TableColumn>
          <TableColumn>TIME TAKEN</TableColumn>
          <TableColumn>CHEATING STATUS</TableColumn>
          <TableColumn>SUBMITTED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {submissions
            .slice((page - 1) * rowsPerPage, page * rowsPerPage)
            .map((submission) => (
              <TableRow key={submission._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{submission.name}</p>
                    <p className="text-sm text-gray-500">{submission.email}</p>
                  </div>
                </TableCell>
                <TableCell>{renderStatusBadge(submission.status)}</TableCell>
                <TableCell>
                  {submission.obtainedGrades ? (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {submission.obtainedGrades.total}/
                        {assessment.obtainableScore}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>{formatTime(submission.timer)}</TableCell>
                <TableCell>
                  {renderCheatingBadge(submission.cheatingStatus)}
                </TableCell>
                <TableCell>
                  {submission.createdAt
                    ? new Date(submission.createdAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    size="sm"
                    variant="light"
                    endContent={<ChevronRight size={16} />}
                    onClick={() => router(submission._id!)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Result;
