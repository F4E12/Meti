"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/lib/model/user";
import { User as UserIcon, Menu } from "lucide-react";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/user");
      if (!res.ok) {
        console.error("Failed to fetch user");
        return;
      }

      const data: { user: User } = await res.json();
      console.log(data.user);
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary"></div>
              <span className="text-xl font-bold text-foreground">METI</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-sm text-foreground hover:text-primary"
              >
                HELP
              </a>
              <a
                href="#"
                className="text-sm text-foreground hover:text-primary"
              >
                ABOUT
              </a>
              <a
                href="#"
                className="text-sm text-foreground hover:text-primary"
              >
                MEDIUM
              </a>
              <a
                href="#"
                className="text-sm text-foreground hover:text-primary"
              >
                GENERAL
              </a>
              <a
                href="#"
                className="text-sm text-foreground hover:text-primary"
              >
                etc
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="default" size="sm" className="rounded-full px-6">
              SEARCH
            </Button>
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                WEAVING
                <br />
                PERSONALIZED
                <br />
                APPAREL
              </h1>
              <div className="flex space-x-4 mb-8">
                <div className="w-16 h-16 bg-primary-foreground"></div>
                <div className="w-16 h-16 bg-primary-foreground"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <div className="w-2 h-2 bg-primary-foreground/50 rounded-full"></div>
                <div className="w-2 h-2 bg-primary-foreground/50 rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="w-32 h-8 bg-primary-foreground rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Text Banner */}
      <div className="border-y border-border py-4 overflow-hidden">
        <div className="animate-scroll whitespace-nowrap">
          <span className="text-sm text-foreground mx-8">
            Apa nich Apa nich Apa nich Apa nich Apa nich Apa nich Apa nich Apa
            nich Apa nich Apa nich Apa nich Apa nich Apa nich Apa nich Apa nich
            Apa nich
          </span>
        </div>
      </div>

      {/* Support Craftsmen Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Support
                <br />
                Craftsmen
              </h2>
            </div>
            <div className="flex space-x-4">
              <div className="w-32 h-40 bg-primary"></div>
              <div className="w-32 h-40 bg-primary"></div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground max-w-md">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex space-x-4">
              <div className="w-32 h-40 bg-primary"></div>
              <div className="w-32 h-40 bg-primary"></div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground">
                Be a Part of
                <br />
                The Heritage
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Local Artisans Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-12">
            100% Made by Local
            <br />
            Artisans
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-primary"></div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Traditional craftsmen who have
            <br />
            contributed to our community
          </p>
          <Button
            variant="outline"
            className="rounded-full px-8 bg-transparent"
          >
            Buy now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Office:</strong>
            </p>
            <p>meti@meti.co.id</p>
            <p>+62 812 3456 789</p>
            <p>
              <strong>FACTORY:</strong> Singosari, Gurat Regency, West Java
              64321, Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
