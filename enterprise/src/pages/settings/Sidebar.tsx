import { useNavigate } from "react-router-dom";
import { Tooltip } from "@nextui-org/tooltip";
import {
  Users,
  ChevronRight,
  Building2,
  Lock,
  SquareChevronRight,
  Boxes,
} from "lucide-react";
import { useEffect, useState } from "react";

const Sidebar = ({
  toast,
  shakeToast,
}: {
  toast: boolean;
  shakeToast: (state: boolean) => void;
}) => {
  const topItems = [
    {
      icon: Building2,
      label: "General",
      link: "/general",
    },
    {
      icon: Users,
      label: "Members",
      link: "/members",
    },
    {
      icon: SquareChevronRight,
      label: "Roles",
      link: "/roles",
    },
    {
      icon: Boxes,
      label: "Departments",
      link: "/departments",
    },
    {
      icon: Lock,
      label: "Security",
      link: "/security/audit-logs",
    },
    // {
    //   icon: Brush,
    //   label: "Personalization",
    //   link: "/personalization",
    // },
  ];

  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setActive(window.location.pathname.split("/")[2]);
  }, []);

  return (
    <>
      <aside
        className={` sticky h-[100vh] min-w-16 px-5 top-0 left-0 hidden transition-width flex-col border-r bg-background sm:flex overflow-x-hidden ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <nav className={`flex flex-col gap-4 sm:py-5 `}>
          {topItems.map((item, index) => (
            <Tooltip key={index} content={item.label} placement="right">
              <table>
                <tbody
                  className={` cursor-pointer h-8 ${
                    active === item.label.toLowerCase()
                      ? " text-white-500 rounded-xl"
                      : "text-muted-foreground opacity-50 hover:text-white"
                  } `}
                  onClick={() => {
                    if (toast) {
                      shakeToast(true);
                      setTimeout(() => {
                        shakeToast(false);
                      }, 1000);
                      return;
                    }
                    navigate(`/settings${item.link}`);
                    setActive(item.label.toLowerCase());
                  }}
                >
                  <tr>
                    <td className="pr-3">
                      {item.icon && <item.icon className="h-7 w-5" />}
                    </td>
                    {collapsed ? null : (
                      <td className="text-start w-full">{item.label}</td>
                    )}
                  </tr>
                </tbody>
              </table>
            </Tooltip>
          ))}
        </nav>

        <div className={` flex w-full mb-5 bottom-0 absolute `}>
          <Tooltip content="Collapse sidebar" placement="right">
            <ChevronRight
              className={`h-5 w-5 text-muted-foreground transition-all  opacity-50 ${
                !collapsed ? "rotate-180" : ""
              }`}
              onClick={() => setCollapsed(!collapsed)}
            />
          </Tooltip>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
