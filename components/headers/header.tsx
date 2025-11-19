// Header.tsx

"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/model/user";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Menu,
  ShoppingBag,
  MessageCircle,
  Palette,
  X,
  Scissors,
  Bookmark,
  Package,
  Search,
  BarChart3,
  LucideIcon,
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- Type Definitions and Data ---

type Role = "guest" | "customer" | "tailor" | "loading";

interface NavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
  roles: Role[];
  isAction?: boolean; // For items usually placed in the action area (like "PROFILE")
}

const NAV_LINKS: NavLink[] = [
  // Common Link
  { href: "/", label: "HOME", roles: ["guest", "customer", "tailor"] },

  // Customer Links
  {
    href: "/featured-weavers",
    label: "SHOP",
    icon: ShoppingBag,
    roles: ["customer"],
  },
  {
    href: "/3d-design/default",
    label: "DESIGN",
    icon: Palette,
    roles: ["customer"],
  },
  { href: "/orders", label: "ORDERS", icon: Package, roles: ["customer"] },
  { href: "/tailors", label: "TAILORS", icon: Scissors, roles: ["customer"] },

  // Tailor Links
  { href: "/work-space", label: "DESIGN", icon: Palette, roles: ["tailor"] },
  { href: "/orders", label: "ORDERS", icon: Package, roles: ["tailor"] },

  // Common Authenticated Link
  {
    href: "/chat",
    label: "CHAT",
    icon: MessageCircle,
    roles: ["customer", "tailor"],
  },

  // Guest Links
  { href: "/about", label: "ABOUT", roles: ["guest"] },
  { href: "/tailors", label: "TAILORS", roles: ["guest"] },
  { href: "/gallery", label: "GALLERY", roles: ["guest"] },
];

const ACTION_LINKS: NavLink[] = [
  // Common Authenticated Actions
  {
    href: "/profile",
    label: "PROFILE",
    icon: UserIcon,
    roles: ["customer", "tailor"],
    isAction: true,
  },

  // Guest Actions
  { href: "/auth/login", label: "LOGIN", roles: ["guest"], isAction: true },
  {
    href: "/auth/sign-up",
    label: "GET STARTED",
    roles: ["guest"],
    isAction: true,
  },
];

// --- Sub-Components (for clarity) ---

/**
 * Renders the main navigation links for desktop view.
 */
function DesktopNav({ currentRole }: { currentRole: Role }) {
  const filteredLinks = NAV_LINKS.filter((link) =>
    link.roles.includes(currentRole)
  );

  return (
    <nav className="hidden lg:flex items-center space-x-8">
      {filteredLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group py-2 flex items-center space-x-1"
          >
            {Icon && (
              <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            )}
            <span>{link.label}</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Renders the action buttons for desktop view (Search, Login/Signup, Profile, etc.).
 */
function DesktopActions({ currentRole }: { currentRole: Role }) {
  if (currentRole === "guest") {
    return (
      <div className="hidden md:flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Link href="/auth/login">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-6 font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            LOGIN
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button
            size="sm"
            className="bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white rounded-full px-6 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            GET STARTED
          </Button>
        </Link>
      </div>
    );
  }

  if (currentRole === "customer") {
    return (
      <div className="hidden md:flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-all duration-300 hover:scale-110"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
          >
            <UserIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  if (currentRole === "tailor") {
    return (
      <div className="hidden md:flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2 relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
        >
          <Bell className="h-4 w-4" />
          {/* Note: In the original tailor-header, this bell had an animated dot, I'll keep it here */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
        </Button>
        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
          >
            <UserIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return null;
}

/**
 * Renders the mobile menu panel.
 */
function MobileMenu({
  currentRole,
  isOpen,
  onClose,
}: {
  currentRole: Role;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const filteredLinks = NAV_LINKS.filter((link) =>
    link.roles.includes(currentRole)
  );
  const filteredActions = ACTION_LINKS.filter((link) =>
    link.roles.includes(currentRole)
  );

  const hasMobileActions = currentRole !== "guest";

  return (
    <div className="lg:hidden bg-white/95 backdrop-blur-md border border-white/20 shadow-lg px-6 py-4 sticky top-[73px] z-40 mx-24 rounded-lg animate-fade-in-up">
      <nav className="flex flex-col space-y-4">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 flex items-center space-x-2 hover:translate-x-2"
              onClick={onClose}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{link.label}</span>
            </Link>
          );
        })}

        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
          {currentRole === "guest" ? (
            // Guest mobile actions (Login/Signup buttons)
            filteredActions.map((link) => (
              <Link key={link.href} href={link.href} onClick={onClose}>
                <Button
                  variant={link.label === "GET STARTED" ? "default" : "ghost"}
                  size="sm"
                  className={`w-full rounded-full font-medium ${
                    link.label === "GET STARTED"
                      ? "bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white shadow-lg"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  } transition-all duration-300`}
                >
                  {link.label}
                </Button>
              </Link>
            ))
          ) : (
            // Authenticated mobile actions (Profile/Bookmarks/Notifications)
            <div className="flex items-center justify-between">
              <Link href="/profile" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  PROFILE
                </Button>
              </Link>
              <div className="flex space-x-2">
                {currentRole === "customer" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                )}
                {currentRole === "tailor" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full p-2 relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full p-2 relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                    >
                      <Package className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

// --- Main Component ---

export default function Header() {
  const [role, setRole] = useState<Role>("loading");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { method: "GET" });
        if (res.redirected) {
          setRole("guest");
          return;
        }
        const data: { user: User } = await res.json();
        // Assuming data.user.role returns "customer" or "tailor"
        setRole(data.user.role as "customer" | "tailor");
      } catch (error) {
        console.error("Error fetching user:", error);
        setRole("guest");
      }
    };

    fetchUser();
  }, []);

  // Show a minimal loading header while fetching user data
  if (role === "loading") {
    return (
      <header className="bg-white/95 backdrop-blur-md border border-white/20 shadow-lg px-6 py-4 sticky top-0 z-50 my-6 mx-24 rounded-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <Image
                src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/LOGO.svg"
                width={24}
                height={24}
                alt="METI Logo"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-gray-900 leading-none">
                METI
              </span>
              <span className="text-xs text-gray-600 font-medium tracking-wide">
                HERITAGE CRAFT
              </span>
            </div>
          </div>
          <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </header>
    );
  }

  // Render main header for all roles
  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border border-white/20 shadow-lg px-6 py-4 sticky top-0 z-50 my-6 mx-24 rounded-lg transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group gap-2 transition-transform duration-300 hover:scale-105"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:rotate-3">
              <Image
                src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/LOGO.svg"
                width={24}
                height={24}
                alt="METI Logo"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-gray-900 leading-none group-hover:text-teal-600 transition-colors duration-300">
                METI
              </span>
              <span className="text-xs text-gray-600 font-medium tracking-wide group-hover:text-pink-500 transition-colors duration-300">
                HERITAGE CRAFT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Filtered by role) */}
          <DesktopNav currentRole={role} />

          {/* Desktop Actions (Rendered based on role) */}
          <DesktopActions currentRole={role} />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Menu (Filtered by role) */}
      <MobileMenu
        currentRole={role}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
