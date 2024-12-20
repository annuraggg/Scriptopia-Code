import React from "react";
import Blank from "./Blank";
import Create from "./Create";
import { useOutletContext } from "react-router-dom";
import Show from "./Show";

const Workflow = () => {
  const { drive } = useOutletContext() as { drive: any };
  const [create, setCreate] = React.useState(false);

  return (
    <div>
      {!drive?.workflow?.steps?.length && <Blank setCreate={setCreate} />}
      {!drive.workflow?.steps?.length && create && <Create />}

      {drive.workflow?.steps?.length && 
      <Show 
      workflowData={drive.workflow.steps} 
      driveTitle={drive.title}
      behavior={drive.workflow.behavior}  />}
    </div>
  );
};

export default Workflow;
