import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth0();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold text-black">TOYODA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <>
                <span className="text-sm text-functional-gray truncate max-w-[200px]">
                  {user?.email}
                </span>
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-functional-gray hover:text-toyoda-red transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-functional-gray hover:text-toyoda-red"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="text-sm text-functional-gray px-2 truncate">
                {user?.email}
              </div>
              <button
                onClick={() => {
                  logout({ logoutParams: { returnTo: window.location.origin } });
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-2 text-sm text-functional-gray hover:text-toyoda-red transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
