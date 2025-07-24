"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function GuestHeader() {
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
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="default" size="sm" className="rounded-full px-6">
            SEARCH
          </Button>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="rounded-full px-4">
              LOGIN
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="default" size="sm" className="rounded-full px-4">
              REGISTER
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
