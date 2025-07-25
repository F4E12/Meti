"use client";

import { Button } from "@/components/ui/button";
import {
  User,
  Menu,
  Package,
  MessageCircle,
  Palette,
  X,
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function TailorHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-background/0 backdrop-blur-md border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center group gap-2">
            <div className="">
              <Image
                src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/LOGO.svg"
                width={24}
                height={24}
                alt=""
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-white/90 leading-none">
                METI
              </span>
              <span className="text-xs text-muted-foreground font-medium tracking-wide">
                HERITAGE CRAFT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors relative group"
            >
              HOME
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/design"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors relative group flex items-center space-x-1"
            >
              <Palette className="h-4 w-4" />
              <span>DESIGN</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/chat"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors relative group flex items-center space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span>CHAT</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors relative group flex items-center space-x-1"
            >
              <Package className="h-4 w-4" />
              <span>ORDERS</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="rounded-full p-2">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-b border-border/50 px-6 py-4 sticky top-[73px] z-40">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/design"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors py-2 flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Palette className="h-4 w-4" />
              <span>DESIGN</span>
            </Link>
            <Link
              href="/chat"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors py-2 flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>CHAT</span>
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-foreground hover:text-coral transition-colors py-2 flex items-center space-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="h-4 w-4" />
              <span>ORDERS</span>
            </Link>
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <User className="h-4 w-4 mr-2" />
                  PROFILE
                </Button>
              </Link>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral rounded-full"></span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 relative"
                >
                  <Package className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral rounded-full"></span>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
