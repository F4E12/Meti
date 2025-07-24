"use client";

import { useEffect, useState } from "react";
import { User } from "@/lib/model/user"; // your custom typed user
import GuestHeader from "./guest-header";
import CustomerHeader from "./customer-header";
import TailorHeader from "./tailor-header";

export default function Header() {
  const [role, setRole] = useState<"guest" | "customer" | "tailor">("guest");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { method: "GET" });
        if (!res.ok) {
          // console.log("Not authenticated, showing guest header");
          return;
        }

        const data: { user: User } = await res.json();
        console.log(data);
        setRole(data.user.role);
      } catch (error) {
        console.error("Error fetching user:", error);
        setRole("guest");
      }
    };

    fetchUser();
  }, []);

  if (role === "customer") {
    return <CustomerHeader />;
  } else if (role === "tailor") {
    return <TailorHeader />;
  } else {
    return <GuestHeader />;
  }
}
