"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/model/user";
import GuestHeader from "./guest-header";
import CustomerHeader from "./customer-header";
import TailorHeader from "./tailor-header";
import Image from "next/image";

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

  if (role === "customer") {
    return <CustomerHeader />;
  } else if (role === "tailor") {
    return <TailorHeader />;
  } else {
    return <GuestHeader />;
  }
}
