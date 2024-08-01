import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import { RootState } from "@/@types/reducer";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { useSelector } from "react-redux";
import axios from "axios";

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  queries?: string[];
  status?: string;
  receivedDate?: string;
}

const Candidates = () => {
  const org = useSelector((state: RootState) => state.organization);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/candidates')
      .then(response => {
        setCandidates(response.data.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setError('Failed to fetch candidates');
        setLoading(false);
      });
  }, []);

  const tableData = candidates.map(candidate => ({
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    received: candidate.receivedDate || 'N/A',
    status: candidate.status || 'N/A',
  }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="mt-5 ml-5">
        <Breadcrumbs>
          <BreadcrumbItem href={"/" + org._id}>Organization</BreadcrumbItem>
          <BreadcrumbItem href={"/" + org._id + "/candidates"}>
            Candidates
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="p-5">
        <DataTable data={tableData} />
      </div>
    </>
  );
};

export default Candidates;