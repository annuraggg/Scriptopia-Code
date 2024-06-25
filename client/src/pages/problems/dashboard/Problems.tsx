import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Sidebar from "./Sidebar";
import ProblemsList from "./ProblemsList";
import Dashboard from "./Dashboard";
import UserGenerated from "./UserGenerated";
import ConundrumCubes from "./ConundrumCubes";
import MyProblems from "./MyProblems";
import Loader from "@/components/Loader";
import ErrorPage from "@/components/ErrorPage";

const Problems = () => {

  const [active, setActive] = useState(0);

  const { error, data, isLoading } = useQuery({
    queryKey: ["problems-section-get-problems"],
    queryFn: async () => (await axios.get("/problems/all/1")).data,
  });

  useEffect(() => {
    const hash = window.location.hash;
    switch (hash) {
      case "#problems":
        setActive(1);
        break;
      case "#user-generated":
        setActive(2);
        break;
      case "#conundrum-cubes":
        setActive(3);
        break;
      case "#my-problems":
        setActive(4);
        break;
      default:
        setActive(0);
    }
  }, []);

  if (isLoading) return <Loader />;
  if (error) return <ErrorPage />;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className=""
    >
      <div className="h-full flex gap-5">
        <Sidebar active={active} setActive={setActive} />
        {active === 0 && <Dashboard />}
        {active === 1 && <ProblemsList problems={data?.data || []} />}
        {active === 2 && <UserGenerated  userproblems={data?.data || []}/>}
        {active === 3 && <ConundrumCubes />}
        {active === 4 && <MyProblems  myproblems={data?.data || []}/>}
      </div>
    </motion.div>
  );
};

export default Problems;
