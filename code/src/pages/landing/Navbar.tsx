import { Link } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const LanderNavbar = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useAuth();

    const handleGetStarted = () => {
        if (isSignedIn) {
            navigate("/dashboard");
        } else {
            navigate("/sign-in");
        }
    };
    return (
        <Navbar
            className="text-white border-b border-gray-800"
            maxWidth="full"
        >
            <div className="flex items-center gap-6">
                <NavbarBrand>
                    <Link to="/" className="flex items-start">
                        <div className="w-8 h-8">
                            <img
                                src={Logo}
                                alt="Logo"
                                className="w-full h-full"
                            />
                        </div>
                    </Link>
                </NavbarBrand>

                <NavbarContent className="hidden sm:flex" justify="start">
                    <NavbarItem>
                        <Link
                            to="https://docs.scriptopia.tech/"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            How it works
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link
                            to="https://docs.scriptopia.tech/creating-a-problem/writing-the-sdsl-code-stub"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            SDSL
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link
                            to="/under-construction"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Support
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link
                            to="/under-construction"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            About
                        </Link>
                    </NavbarItem>
                </NavbarContent>
            </div>

            <NavbarContent justify="end">
                <NavbarItem>
                    <Button
                        as={Link}
                        variant="light"
                        className="text-gray-300 hover:text-white"
                        onClick={handleGetStarted}
                    >
                        Sign In
                    </Button>
                </NavbarItem>
                <NavbarItem>
                    <Button
                        as={Link}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleGetStarted}
                    >
                        Sign Up
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
};

export default LanderNavbar;