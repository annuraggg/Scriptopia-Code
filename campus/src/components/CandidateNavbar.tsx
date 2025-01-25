import { UserButton } from "@clerk/clerk-react";

const CandidateNavbar = () => {
  return (
    <div className="w-full px-5 py-3">
      <div className="flex justify-between">
        <div className="flex items-center">
          <img src="/logo.png" alt="logo" className="w-7" />
          <p className="text-md ml-2 opacity-80">Enterprise</p>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default CandidateNavbar;
