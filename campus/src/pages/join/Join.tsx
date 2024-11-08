import ax from "@/config/axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CircularProgress,
} from "@nextui-org/react";
import { HeartCrack, Link } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const bgStyle = {
  backgroundImage: "url(./join-bg.svg)",
  backgroundSize: "cover",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(100px)",
};

interface Token {
  inviter: string;
  institute: string;
  role: string;
  email: string;
  instituteName: string;
}

const Join = () => {
  const [loading, setLoading] = useState(true);
  const { isSignedIn, user, isLoaded } = useUser();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(false);

  const [token, setToken] = useState<Token>({} as Token);

  const { getToken } = useAuth();
  const axios = ax(getToken);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    axios
      .post("/campus/verify", { token })
      .then((data) => {
        setToken(data.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = (status: "accept" | "decline") => {
    setSubmitLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    axios
      .post("/campus/join", { status, token })
      .then(() => {
        toast.success("Joined Insitute");
        setTimeout(() => {
          window.location.href = "/institute/dashboard"
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to join Insitute");
      })
      .finally(() => setSubmitLoading(false));
  };

  return (
    <div
      style={bgStyle}
      className={`${loading ? "opacity-50" : ""} transition-all`}
    >
      <div>
        {!isSignedIn || !isLoaded || loading ? (
          <CircularProgress />
        ) : error ? (
          <Card>
            <CardHeader className="justify-center">
              You received an invite but...
            </CardHeader>
            <CardBody className="items-center px-10 w-[30vw]">
              <HeartCrack size={100} className="opacity-50 text-red-500" />
              <h3 className="mt-3">Invite Invalid</h3>
              <p className="mt-5 opacity-50 text-center">
                The Invite may have expired or you may not have permission to
                join this Institute
              </p>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader className="justify-center">
            Institute Invite
            </CardHeader>
            <CardBody className="items-center px-10 w-[30vw]">
              <div className="flex gap-5 items-center">
                <Avatar src={user?.imageUrl} size="lg" />
                <Link />
                <Avatar size="lg" />
              </div>
              <p className="mt-5 opacity-50">
                {token.inviter
                  ? `${token.inviter} has invited you to join`
                  : "You have been invited to join"}
              </p>
              <h3 className="mt-3 text-center">
                {token?.institute
                  ? token.instituteName
                  : "Institute"}
              </h3>
            </CardBody>
            <CardFooter>
              <Button
                className="w-full mr-2"
                color="danger"
                variant="flat"
                onClick={() => handleJoin("decline")}
                isDisabled={submitLoading}
                isLoading={submitLoading}
              >
                Decline
              </Button>
              <Button
                className="w-full"
                color="success"
                variant="flat"
                onClick={() => handleJoin("accept")}
                isDisabled={submitLoading}
                isLoading={submitLoading}
              >
                Join
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Join;
