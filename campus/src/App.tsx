import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OrganizationLayout from "./components/layout/OrganizationLayout";
import { Suspense, lazy } from "react";
import { Spinner } from "@nextui-org/react";
import DriveLayout from "./pages/jobs/job/Layout";

import SettingsLayout from "./pages/settings/Layout";
import Start from "./pages/start/Start";
import Join from "./pages/join/Join";
import Notifications from "./pages/notifications/Notifications";
import Support from "./pages/support/Support";
import Billing from "./pages/billing/Billing";

const GeneralSettings = lazy(() => import("./pages/settings/general/General"));
const Members = lazy(() => import("./pages/settings/members/Member"));
const Roles = lazy(() => import("./pages/settings/roles/Roles"));
const Security = lazy(() => import("./pages/settings/security/Security"));
const AuditLogs = lazy(
  () => import("./pages/settings/security/audit-logs/Audit-Logs")
);
const OrgData = lazy(() => import("./pages/settings/security/data/Data"));

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Drives = lazy(() => import("./pages/jobs/Drives"));
const Candidates = lazy(() => import("./pages/candidates/Candidates"));
const Analytics = lazy(() => import("./pages/analytics/Analytics"));
const Calendar = lazy(() => import("./pages/calendar/Calendar"));
const DriveDashboard = lazy(
  () => import("./pages/jobs/job/dashboard/Dashboard")
);
const Workflow = lazy(() => import("./pages/jobs/job/workflow/Workflow"));
const Ats = lazy(() => import("./pages/jobs/job/ats/Ats"));
const DriveCandidates = lazy(
  () => import("./pages/jobs/job/candidates/Candidates")
);

const Loader = () => (
  <div className="spinner-container">
    <Spinner label="Loading..." color="default" />
  </div>
);

const settingsRoute = [
  {
    path: "general",
    element: <Suspense fallback={<Loader />} children={<GeneralSettings />} />,
  },
  {
    path: "members",
    element: <Suspense fallback={<Loader />} children={<Members />} />,
  },
  {
    path: "roles",
    element: <Suspense fallback={<Loader />} children={<Roles />} />,
  },
  {
    path: "security",
    element: <Suspense fallback={<Loader />} children={<Security />} />,
  },
  {
    path: "security/audit-logs",
    element: <Suspense fallback={<Loader />} children={<AuditLogs />} />,
  },
  {
    path: "security/data",
    element: <Suspense fallback={<Loader />} children={<OrgData />} />,
  },
];

const jobRoutes = [
  {
    path: "dashboard",
    element: <Suspense fallback={<Loader />} children={<DriveDashboard />} />,
  },
  {
    path: "workflow",
    element: <Suspense fallback={<Loader />} children={<Workflow />} />,
  },
  {
    path: "ats",
    element: <Suspense fallback={<Loader />} children={<Ats />} />,
  },
  {
    path: "candidates",
    element: <Suspense fallback={<Loader />} children={<DriveCandidates />} />,
  },
];

function App() {
  const routes = createBrowserRouter([
    {
      path: "/organization",
      element: <OrganizationLayout />,
      children: [
        {
          path: "dashboard",
          element: <Suspense fallback={<Loader />} children={<Dashboard />} />,
        },
        {
          path: "drives",
          element: <Suspense fallback={<Loader />} children={<Drives />} />,
        },
        {
          path: "drives/:id",
          element: <DriveLayout />,
          children: jobRoutes,
        },
        {
          path: "candidates",
          element: <Suspense fallback={<Loader />} children={<Candidates />} />,
        },
        {
          path: "analytics",
          element: <Suspense fallback={<Loader />} children={<Analytics />} />,
        },
        {
          path: "calendar",
          element: <Suspense fallback={<Loader />} children={<Calendar />} />,
        },
        {
          path: "notifications",
          element: <Suspense fallback={<Loader />} children={<Notifications />} />,
        },
        {
          path: "settings",
          element: <SettingsLayout />,
          children: settingsRoute,
        },
        {
          path: "billing",
          element: <Suspense fallback={<Loader />} children={<Billing />} />,
        },
        {
          path: "support",
          element: <Suspense fallback={<Loader />} children={<Support />} />,
        }
      ],
    },
    {
      path: "create",
      element: <Suspense fallback={<Loader />} children={<Start />} />,
    },
    {
      path: "/join",
      element: <Suspense fallback={<Loader />} children={<Join />} />,
    },
    {
      path: "/student-portal",
      element: <></>,
    },
  ]);

  return <RouterProvider router={routes} />;
}

export default App;