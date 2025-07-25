"use client";

import { Button } from "@/components/ui/button";
import { Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function GuestHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                alt=""
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group py-2"
            >
              HOME
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group py-2"
            >
              ABOUT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              href="/tailors"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group py-2"
            >
              TAILORS
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group py-2"
            >
              GALLERY
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border border-white/20 shadow-lg px-6 py-4 sticky top-[73px] z-40 mx-24 rounded-lg animate-fade-in-up">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link
              href="/tailors"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              TAILORS
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              GALLERY
            </Link>
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-full font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
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
                  className="w-full bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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
