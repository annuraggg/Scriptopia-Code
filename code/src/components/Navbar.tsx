import { UserButton, useAuth } from "@clerk/clerk-react";
import { Link, Button } from "@nextui-org/react";
import { EllipsisVertical, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const handleMenu = () => {
    setShowMenu(!showMenu);
  };

  const { orgId } = useAuth();

  const links = [
    {
      path: "/problems",
      label: "Problems",
    },
    {
      path: "/assessments",
      label: "Assessments",
    },
  ];

  const openOrg = () => {
    if (orgId === null) window.location.href = "/organization/intro";
    else window.location.href = "/organization";
  };

  const { theme, setTheme } = useTheme();

  return (
    <>
      <div
        className={
          "px-5 sm:px-10 w-full h-[8vh] flex items-center justify-between sticky top-0 z-50 backdrop-filter backdrop-blur-lg"
        }
      >
        <div className="flex items-center gap-2 sm:gap-5">
          <img
            src="/logo.svg"
            alt="logo"
            className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-5 cursor-pointer"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          />
          <p className="flex text-md sm:text-base duration-200 transition-all md:hidden">
            Scriptopia
          </p>
          {links.map((link) => (
            <a
              key={link.path}
              href={link.path}
              className="text-sm sm:text-base hover:text-blue-500 duration-200 transition-all hidden md:block"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="hidden md:flex items-center gap-3">
            {<Dropdown>
              <DropdownTrigger className="cursor-pointer"><Menu size={22} /></DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem onClick={openOrg}>Organization</DropdownItem>
                <DropdownItem onClick={() => navigate("/profile")}>Profile</DropdownItem>
              </DropdownMenu>
            </Dropdown>}
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <UserButton />
          </div>
          <div className="flex md:hidden" onClick={handleMenu}>
            {!showMenu ? <Menu size={22} /> : <X size={22} />}
          </div>
        </div>
      </div>
      <div
        className={
          !showMenu
            ? "fixed left-[-100] ease-in-out duration-400 hidden md:block"
            : "fixed relaive z-20 left-0 top-0 w-[100%] h-full border-r-gray-900 backdrop-blur-lg ease-in-out duration-400 md:hidden"
        }
      >
        <div className="flex flex-col items-center pt-20 h-full md:hidden">
          <div className="flex items-center pl-2 gap-2 sm:gap-5 border-1 border-gray-600 shadow-md md:hidden my-2  w-[80%] h-[8%] rounded-md justify-start">
            <UserButton />
            <EllipsisVertical />
          </div>
          {links.map((link) => (
            <Button
              key={link.path}
              href={link.path}
              className="flex text-md sm:text-base text-left border-1 border-gray-600 shadow-md md:hidden my-2  w-[80%] h-[8%] rounded-md justify-start"
              as={Link}
              color="primary"
              showAnchorIcon
              variant="ghost"
            >
              {link.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;