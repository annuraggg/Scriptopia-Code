import { Spinner } from "@nextui-org/react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-[100vh] z-50">
      <Spinner color="danger" />
    </div>
  );
};

export default Loader;
