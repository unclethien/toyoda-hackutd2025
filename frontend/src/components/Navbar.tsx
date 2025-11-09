import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth0();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Display name priority: name > nickname > email
  const displayName = user?.name || user?.nickname || user?.email;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size={36} />
            <span className="text-xl font-bold text-black">TOYODA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <>
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {displayName}
                </span>
                <Button
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground px-2 truncate">
                {displayName}
              </div>
              <Button
                onClick={() => {
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  });
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                className="justify-start text-muted-foreground hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
