import { Tooltip } from "@nextui-org/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconBellFilled,
  IconBookFilled,
  IconBriefcaseFilled,
  IconFileDescriptionFilled,
  IconFileTextFilled,
  IconLayoutDashboardFilled,
  IconUserFilled,
  IconLayoutKanbanFilled,
  IconFolderFilled,
  IconTrophyFilled,
  IconRosetteDiscountCheckFilled,
  IconDiamondFilled,
  IconCopyrightFilled,
  IconGlobeFilled,
  IconSquareRoundedPlusFilled,
  IconColorPicker,
  IconBooks,
  IconUsersGroup,
} from "@tabler/icons-react";
import { UserButton } from "@clerk/clerk-react";

interface SidebarProps {
  icon: any;
  label: string;
  link: string;
  visible?: boolean;
  length?: number;
  children?: SidebarProps[];
}

const profileItems: SidebarProps[] = [
  {
    icon: IconFileDescriptionFilled,
    label: "General",
    link: "",
    visible: true,
  },
  {
    icon: IconBookFilled,
    label: "Education",
    link: "education",
    visible: true,
  },
  { icon: IconBriefcaseFilled, label: "Work", link: "work", visible: true },
  { icon: IconColorPicker, label: "Skills", link: "skills", visible: true },
  {
    icon: IconLayoutKanbanFilled,
    label: "Responsibilities",
    link: "responsibilities",
    visible: true,
  },
  {
    icon: IconFolderFilled,
    label: "Projects",
    link: "projects",
    visible: true,
  },
  { icon: IconTrophyFilled, label: "Awards", link: "awards", visible: true },
  {
    icon: IconRosetteDiscountCheckFilled,
    label: "Certifications",
    link: "certifications",
    visible: true,
  },
  {
    icon: IconDiamondFilled,
    label: "Competitions",
    link: "competitions",
    visible: true,
  },
  {
    icon: IconUserFilled,
    label: "Conferences",
    link: "conferences",
    visible: true,
  },
  {
    icon: IconCopyrightFilled,
    label: "Patents",
    link: "patents",
    visible: true,
  },
  {
    icon: IconBooks,
    label: "Scholarships",
    link: "scholarships",
    visible: true,
  },
  {
    icon: IconGlobeFilled,
    label: "Volunteering",
    link: "volunteering",
    visible: true,
  },
  {
    icon: IconSquareRoundedPlusFilled,
    label: "Extra Curricular",
    link: "extra-curricular",
    visible: true,
  },
];

const campusItems: SidebarProps[] = [
  {
    icon: IconBriefcaseFilled,
    label: "Drives",
    link: "drives",
    visible: true,
  },
  {
    icon: IconUsersGroup,
    label: "Placement Groups",
    link: "placement-groups",
    visible: true,
  },
  {
    icon: IconFileTextFilled,
    label: "Resume",
    link: "resume",
    visible: true,
  },
];

const Sidebar = () => {
  const [active, setActive] = useState<string>("");
  const [expandedItem, setExpandedItem] = useState<SidebarProps | null>(null);
  const navigate = useNavigate();

  const topItems: SidebarProps[] = [
    {
      icon: IconLayoutDashboardFilled,
      label: "Dashboard",
      link: "dashboard",
      visible: true,
    },
    {
      icon: IconUserFilled,
      label: "Profile",
      link: "profile",
      visible: true,
      children: profileItems,
    },
    // { icon: IconBriefcaseFilled, label: "Jobs", link: "jobs", visible: true },
    {
      icon: IconBookFilled,
      label: "Campus",
      link: "campus",
      visible: true,
      children: campusItems,
    },
  ];

  const bottomItems: SidebarProps[] = [
    {
      icon: IconBellFilled,
      label: "Notifications",
      link: "notifications",
      visible: true,
      length: 3,
    },
  ];

  const changePage = (item: SidebarProps, parentLink?: string) => {
    setActive(item.label);

    // If we have a parentLink, navigate to the parent/child pattern
    if (parentLink) {
      navigate(`${parentLink}/${item.link}`);
    } else {
      navigate(item.link);
      setExpandedItem(item.children ? item : null);
    }
  };

  return (
    <div className="h-screen flex bg-foreground text-background rounded-r-2xl ">
      <div className="flex flex-col items-center justify-between py-5">
        <div>
          <img src="/logo.svg" alt="Logo" className="w-10 h-10 mb-5 mx-auto" />
          {topItems.map((item) => (
            <Tooltip key={item.label} content={item.label} placement="right">
              <div
                className={`cursor-pointer m-3 p-2 rounded-xl hover:bg-zinc-50/10 ${
                  active === item.label && "bg-zinc-50/10"
                }`}
                onClick={() => changePage(item)}
              >
                <item.icon />
              </div>
            </Tooltip>
          ))}
        </div>
        <div className="justify-self-end flex flex-col items-center gap-4">
          <UserButton />
          {bottomItems.map((item) => (
            <Tooltip key={item.label} content={item.label} placement="right">
              <div className="cursor-pointer m-2 p-1">
                <item.icon />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {expandedItem?.children && (
        <div className="bg-foreground text-background py-2 px-4 rounded-r-2xl scroll-m-5 overflow-y-auto my-3 w-[250px]">
          {expandedItem.children.map((child) => (
            <div
              key={child.label}
              className={`cursor-pointer m-3 p-2 flex items-center rounded-xl hover:bg-zinc-50/10 ${
                active === child.label && "bg-zinc-50/10"
              }`}
              onClick={() => changePage(child, expandedItem.link)}
            >
              <child.icon className="mr-3 min-w-6" />
              <p className="text-sm">{child.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
