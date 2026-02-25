import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@heroui/react";
import {
  Home,
  Users,
  Route,
  BarChart3,
  UserCircle,
  Mail,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "User Data", href: "/userdata", icon: Users },
  { name: "Routes", href: "/routes", icon: Route },
  { name: "Statistics", href: "/statistics", icon: BarChart3 },
  { name: "Account", href: "/useraccount", icon: UserCircle },
  { name: "Contact", href: "/contact", icon: Mail },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Navbar
        maxWidth="full"
        className="border-b border-default-100"
        classNames={{
          base: "bg-background/80 backdrop-blur-md",
        }}
      >
        <NavbarContent justify="start">
          <NavbarBrand>
            <NavLink to="/" className="font-bold text-inherit text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              BC Stats
            </NavLink>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-6" justify="center">
          {navItems.map((item) => (
            <NavbarItem key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-semibold tracking-wide ${
                    isActive ? "text-primary" : "text-foreground hover:text-primary"
                  }`
                }
              >
                <item.icon size={16} />
                {item.name}
              </NavLink>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem className="hidden sm:flex">
            <NavLink to="/login">
              <Button color="primary" variant="flat" size="sm">
                Sign In
              </Button>
            </NavLink>
          </NavbarItem>
          {/* Custom hamburger button with Lucide icons */}
          <button
            onClick={toggleMenu}
            className="sm:hidden flex justify-center items-center w-10 h-10 cursor-pointer"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </NavbarContent>
      </Navbar>

      {/* Custom Mobile Menu - No animations */}
      {isMenuOpen && (
        <div className="sm:hidden fixed inset-0 top-16 z-50 bg-background">
          <nav className="flex flex-col p-6 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-default-100"
                  }`
                }
              >
                <item.icon size={22} className="text-current" />
                <span className="text-lg font-semibold">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-default-100 py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-default-600">
            © 2024 BC Stats. All rights reserved.
          </p>
          <div className="flex gap-6">
            <NavLink to="/contact" className="text-sm text-default-600 hover:text-foreground">
              Contact
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
