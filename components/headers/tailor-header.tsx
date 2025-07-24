"use client";

import { Button } from "@/components/ui/button";
import { User, Menu } from "lucide-react";
import Link from "next/link";

export default function TailorHeader() {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary"></div>
            <span className="text-xl font-bold text-foreground">METI</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm text-foreground hover:text-primary"
            >
              HOME
            </Link>
            <Link
              href="/design"
              className="text-sm text-foreground hover:text-primary"
            >
              DESIGN
            </Link>
            <Link
              href="/chat"
              className="text-sm text-foreground hover:text-primary"
            >
              CHAT
            </Link>
            <Link
              href="/order"
              className="text-sm text-foreground hover:text-primary"
            >
              ORDER
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="default" size="sm" className="rounded-full px-6">
            SEARCH
          </Button>
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
