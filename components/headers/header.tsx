"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/model/user";
import GuestHeader from "./guest-header";
import CustomerHeader from "./customer-header";
import TailorHeader from "./tailor-header";

export default function Header() {
  const [role, setRole] = useState<"guest" | "customer" | "tailor" | "loading">(
    "loading"
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { method: "GET" });
        if (!res.ok) {
          setRole("guest");
          return;
        }
        const data: { user: User } = await res.json();
        setRole(data.user.role);
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
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-teal-pink rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-2xl font-serif font-bold text-foreground">
              METI
            </span>
          </div>
          <div className="w-20 h-8 bg-muted animate-pulse rounded-full"></div>
        </div>
      </header>
    );
  }

  if (role === "customer") {
    return <CustomerHeader />;
  } else if (role === "tailor") {
    return <TailorHeader />;
  } else {
    return <GuestHeader />;
  }
}
