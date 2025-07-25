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
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function TailorHeader() {
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
              href="/work-space"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group flex items-center space-x-1 py-2"
            >
              <Palette className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span>DESIGN</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              href="/chat"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group flex items-center space-x-1 py-2"
            >
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span>CHAT</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group flex items-center space-x-1 py-2"
            >
              <Package className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span>ORDERS</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 relative group flex items-center space-x-1 py-2"
            >
              <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span>ANALYTICS</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
              >
                <User className="h-4 w-4" />
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
              href="/work-space"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 flex items-center space-x-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Palette className="h-4 w-4" />
              <span>DESIGN</span>
            </Link>
            <Link
              href="/chat"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 flex items-center space-x-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>CHAT</span>
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 flex items-center space-x-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="h-4 w-4" />
              <span>ORDERS</span>
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 py-2 flex items-center space-x-2 hover:translate-x-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BarChart3 className="h-4 w-4" />
              <span>ANALYTICS</span>
            </Link>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  PROFILE
                </Button>
              </Link>
              <div className="flex space-x-2">
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
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
