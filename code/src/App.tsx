import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import ErrorPage from "./components/ErrorPage";
import { useTheme } from "./components/theme-provider";
import Loader from "./components/Loader"; // Import Loader component
// Lazy loading components
const Home = lazy(() => import("./pages/home/Home"));
const AssessmentDashboard = lazy(
  () => import("./pages/assessments/dashboard/Assessments")
);
const Lander = lazy(() => import("./pages/landing/Lander"));
const UnderConstruction = lazy(
  () => import("./pages/landing/UnderConstruction")
);
const Problems = lazy(() => import("./pages/problems/dashboard/Problems"));
const Problem = lazy(() => import("./pages/problems/problem/Problem"));
const NewProblem = lazy(() => import("./pages/problems/new/NewProblem"));
const NewMCQ = lazy(() => import("./pages/assessments/new/mcq/New"));
const NewCode = lazy(() => import("./pages/assessments/new/code/New"));
//  const AssessmentCurrent = lazy(
//    () => import("./pages/assessments/assess/CodeDashboard")
//  );
//  const AssessmentCurrentProblem = lazy(
//    () => import("./pages/assessments/assess/problem/Problem")
//  );
//  const Result = lazy(() => import("./pages/assessments/assess/result/Result"));
const ViewAssessment = lazy(
  () => import("./pages/assessments/dashboard/ViewAssessment/ViewAssessment")
);
const ViewUserAssessment = lazy(
  () =>
    import("./pages/assessments/dashboard/ViewAssessment/ViewUserAssessment")
);

const MCQAssessment = lazy(
  () => import("./pages/assessments/assess/mcq/Assess")
);

const CodeAssessment = lazy(
  () => import("./pages/assessments/assess/code/Assess")
);

const router = createBrowserRouter([
  {
    path: "/under-construction",
    element: <UnderConstruction />,
  },
  {
    path: "/",
    element: <Lander />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "dashboard",
        element: <Home />,
      },
      {
        path: "assessments",
        element: <AssessmentDashboard />,
      },
      {
        path: "assessments/:id/view",
        element: <ViewAssessment />,
      },
      {
        path: "assessments/:id/view/:cid",
        element: <ViewUserAssessment />,
      },
      {
        path: "assessments/new/mcq",
        element: <NewMCQ />,
      },
      {
        path: "assessments/new/code",
        element: <NewCode />,
      },
      {
        path: "problems",
        element: <Problems />,
      },
      {
        path: "problems/new",
        element: <NewProblem />,
      },
      {
        path: "problems/:id",
        element: <Problem />,
      },
    ],
  },
  {
    path: "/assessments/c/:id",
    element: <CodeAssessment />,
  },
  {
    path: "/assessments/m/:id",
    element: <MCQAssessment />,
  },
  //  {
  //    path: "/assessments/:id/current",
  //    element: <AssessmentCurrent />,
  //  },
  //  {
  //    path: "/assessments/:id/current/:probid",
  //    element: <AssessmentCurrentProblem />,
  //  },
  //  {
  //    path: "/assessments/result",
  //    element: <Result />,
  //  },
]);

function App() {
  const { theme } = useTheme();
  return (
    <main
      className={`${
        theme === "dark" ? "dark" : ""
      } text-foreground bg-background`}
    >
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </main>
  );
}

export default App;
