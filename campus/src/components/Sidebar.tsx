import { useNavigate } from "react-router-dom";
import { Tooltip } from "@nextui-org/tooltip";
import { ChevronRight, X } from "lucide-react";
import {
  IconLayoutDashboardFilled,
  IconBriefcaseFilled,
  IconUserFilled,
  IconChartPieFilled,
  IconBellFilled,
  IconSettingsFilled,
  IconBuilding,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { UserButton /*useAuth*/ } from "@clerk/clerk-react";
import { Badge, Button } from "@nextui-org/react";
import { MemberWithPermission } from "@shared-types/MemberWithPermission";
import { Notification } from "@shared-types/Institute";
import { ExtendedInstitute } from "@shared-types/ExtendedInstitute";

const Sidebar = ({
  notifications,
  user,
  isMobile,
  onClose,
}: {
  notifications: Notification[];
  institute: ExtendedInstitute;
  user: MemberWithPermission;
  isMobile: boolean;
  onClose?: () => void;
}) => {
  const topItems = [
    {
      icon: IconLayoutDashboardFilled,
      label: "Dashboard",
      link: "/dashboard",
      visible: true,
    },
    {
      icon: IconBriefcaseFilled,
      label: "Drives",
      link: "/drives",
      visible:
        user?.permissions?.includes("view_drive") ||
        user?.permissions?.includes("manage_drive"),
    },
    {
      icon: IconUsersGroup,
      label: "Placement Groups",
      link: "/placement-groups",
      visible:
        user?.permissions?.includes("view_drive") ||
        user?.permissions?.includes("manage_drive"),
    },
    {
      icon: IconBuilding,
      label: "Company Profiles",
      link: "/companyprofiles",
      visible:
        user?.permissions?.includes("view_drive") ||
        user?.permissions?.includes("manage_drive"),
    },
    {
      icon: IconUserFilled,
      label: "Candidates",
      link: "/candidates/active",
      visible:
        user?.permissions?.includes("view_drive") ||
        user?.permissions?.includes("manage_drive"),
    },
    {
      icon: IconChartPieFilled,
      label: "Analytics",
      link: "/analytics",
      visible:
        user?.permissions?.includes("view_analytics") ||
        user?.permissions?.includes("manage_institute"),
    },
    // {
    //   icon: Calendar,
    //   label: "Calendar",
    //   link: "/calendar",
    //   visible: true,
    // },
  ];

  const bottomItems = [
    {
      icon: IconBellFilled,
      label: "Notifications",
      link: "/notifications",
      visible: true,
      length: notifications?.length,
    },
    {
      icon: IconSettingsFilled,
      label: "Settings",
      link: "/settings/general",
      visible: user?.permissions?.includes("manage_institute"),
    },
    // {
    //   icon: IconCreditCardFilled,
    //   label: "Billing",
    //   link: "/billing",
    //   visible:
    //     user?.permissions?.includes("view_billing") ||
    //     user?.permissions?.includes("manage_billing"),
    // },
    // {
    //   icon: BookOpenText,
    //   label: "Documentation",
    //   link: "/documentation",
    //   visible: true,
    // },
    // {
    //   icon: HelpCircle,
    //   label: "Support",
    //   link: "/support",
    //   visible: true,
    // },
  ];

  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActive(window.location.pathname.split("/")[1]);
  }, []);

  return (
    <aside
      className={`h-[100vh] bg-foreground text-background rounded-r-2xl border-r flex flex-col overflow-hidden transition-all duration-300 
        ${isMobile ? "w-64" : collapsed ? "w-16" : "w-64"}
        ${isMobile ? "fixed left-0 top-0" : "relative"}`}
    >
      {/* Mobile Close Button */}
      {isMobile && (
        <Button
          isIconOnly
          variant="light"
          className="absolute top-4 right-4"
          onPress={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      )}

      <nav className="flex flex-col gap-2 p-3">
        {(!isMobile || !collapsed) && (
          <div className={`${isMobile ? "mt-12" : "mt-4"} mb-6`}>
            <img
              src="/logo.png"
              alt="logo"
              className="cursor-pointer h-10"
              onClick={() => {
                window.location.href = "/";
              }}
            />
          </div>
        )}

        {topItems.map((item, index) => (
          <Tooltip
            key={index}
            content={item.label}
            placement="right"
            isDisabled={isMobile || !collapsed}
          >
            <div
              className={`${!item.visible ? "hidden" : ""}`}
              onClick={() => {
                navigate(item.link);
                setActive(item.label.toLowerCase());
                if (isMobile) onClose?.();
              }}
            >
              <div
                className={`flex items-center p-2 py-3 rounded-lg cursor-pointer transition-colors duration-200  
                  ${
                    active?.toLowerCase() === item.label.toLowerCase()
                      ? "bg-primary text-foreground"
                      : "text-default hover:bg-accent/40"
                  }`}
              >
                <div className="min-w-[24px] flex items-center justify-center">
                  <item.icon className="w-6 h-6" />
                </div>
                {(!collapsed || isMobile) && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </div>
            </div>
          </Tooltip>
        ))}
      </nav>

      <nav className="mt-auto flex flex-col gap-2 p-3">
        <div className="ml-[6px] mb-4">
          <UserButton />
        </div>

        {bottomItems.map((item, index) => (
          <Tooltip
            key={index}
            content={item.label}
            placement="right"
            isDisabled={isMobile || !collapsed}
          >
            <div
              className={`${!item.visible ? "hidden" : ""}`}
              onClick={() => {
                navigate(item.link);
                setActive(item.label.toLowerCase());
                if (isMobile) onClose?.();
              }}
            >
              <div
                className={`flex items-center p-2 py-3 rounded-xl cursor-pointer transition-colors duration-200   
                  ${
                    active?.toLowerCase() === item.label.toLowerCase()
                      ? "bg-primary text-foreground"
                      : "text-default hover:bg-accent/40"
                  }`}
              >
                <div className="min-w-[24px] flex items-center justify-center relative">
                  <Badge
                    content={item?.length}
                    color="warning"
                    className={!item?.length ? "hidden" : ""}
                  >
                    <item.icon className="w-5 h-5" />
                  </Badge>
                </div>
                {(!collapsed || isMobile) && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </div>
            </div>
          </Tooltip>
        ))}

        {/* Collapse Button */}
        {!isMobile && (
          <div className="flex w-full mt-4 px-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-xl transition-colors duration-200 w-full"
            >
              <ChevronRight
                className={`h-5 w-5 text-default-500 transition-transform duration-200 
                  ${!collapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
