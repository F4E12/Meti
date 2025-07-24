"use client";

import { Button } from "@/components/ui/button";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function GuestHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-teal-pink rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-foreground leading-none">
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
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              HOME
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              ABOUT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/tailors"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              TAILORS
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
            >
              GALLERY
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <Search className="h-4 w-4" />
            </Button>
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-6 font-medium"
              >
                LOGIN
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button
                size="sm"
                className="bg-gradient-teal-pink hover:opacity-90 text-white rounded-full px-6 font-medium shadow-lg"
              >
                GET STARTED
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
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link
              href="/tailors"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TAILORS
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              GALLERY
            </Link>
            <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-full font-medium"
                >
                  LOGIN
                </Button>
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  size="sm"
                  className="w-full bg-gradient-teal-pink hover:opacity-90 text-white rounded-full font-medium"
                >
                  GET STARTED
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
