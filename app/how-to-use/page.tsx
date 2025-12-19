"use client";

import React from "react";
import {
  Ruler,
  Search,
  Box,
  UserCheck,
  MessageCircle,
  ArrowRight,
  Shirt,
} from "lucide-react";
import Header from "@/components/headers/header";

const MetiGuide = () => {
  return (
    <div className="">
      <Header />
      <div className="min-h-screen bg-background text-foreground font-sans">
        {/* HERO SECTION */}
        <header className="bg-primary text-primary-foreground py-16 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6">
              <Shirt className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Tailoring Reimagined.
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Discover the ancient art of Indonesian weaving brought to life
              through modern technology. Connect with master artisans who carry
              centuries of traditional knowledge.
            </p>
          </div>
        </header>

        {/* STEPS CONTAINER */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              How to use METI
            </h2>
            <p className="text-muted-foreground text-lg">
              Your journey to custom fashion in 5 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* STEP 1: MEASURE */}
            <div className="relative group rounded-xl border-2 border-border/30 bg-card p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="absolute -top-6 left-6 bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                1
              </div>
              <div className="mt-4 mb-4 text-destructive">
                <Ruler size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">
                AI Body Measurement
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Start by visiting your <strong>Profile Page</strong>. Use our
                smart AI tool to scan and generate your precise body
                measurements instantly. No measuring tape required.
              </p>
            </div>

            {/* STEP 2: BROWSE */}
            <div className="relative group rounded-xl border-2 border-border/30 bg-card p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="absolute -top-6 left-6 bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                2
              </div>
              <div className="mt-4 mb-4 text-destructive">
                <Search size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">
                Discover Patterns
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Browse our curated list of featured weavers. Explore authentic{" "}
                <strong>Batik patterns</strong> and cultural motifs from local
                artisans.
              </p>
            </div>

            {/* STEP 3: DESIGN */}
            <div className="relative group rounded-xl border-2 border-border/30 bg-card p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="absolute -top-6 left-6 bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                3
              </div>
              <div className="mt-4 mb-4 text-destructive">
                <Box size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">
                3D Customization
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Visualize it before you buy. Create a <strong>3D model</strong>{" "}
                with your chosen pattern. Change colors, adjust tile patterns,
                and modify the style until it&apos;s perfect.
              </p>
            </div>

            {/* STEP 4: CONNECT */}
            <div className="relative group rounded-xl border-2 border-border/30 bg-card p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="absolute -top-6 left-6 bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                4
              </div>
              <div className="mt-4 mb-4 text-destructive">
                <UserCheck size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">
                Find a Tailor
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Happy with your design? Save it and you can connect with a
                talented <strong>local tailor</strong> who specializes in your
                chosen style.
              </p>
            </div>

            {/* STEP 5: TRACK & CHAT */}
            <div className="relative group rounded-xl border-2 border-border/30 bg-card p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 md:col-span-2 lg:col-span-2 lg:col-start-1 lg:col-end-3">
              <div className="absolute -top-6 left-6 bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                5
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="mt-4 text-destructive shrink-0">
                  <MessageCircle size={48} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary mb-3 mt-4 md:mt-0">
                    Track & Chat (with Translation)
                  </h3>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Monitor your order details in real-time. Need to ask the
                    tailor a question? Use our built-in chat.
                  </p>
                  <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/30">
                    <p className="text-sm font-medium text-primary">
                      ✨ <strong>Smart Feature:</strong> Our chat includes an
                      automatic translator. It converts local dialects to
                      standard Indonesian (and vice-versa) so you and your
                      tailor always understand each other perfectly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA CARD */}
            <div className="flex flex-col justify-center items-center rounded-xl bg-primary text-primary-foreground p-8 shadow-lg text-center lg:col-start-3">
              <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
              <p className="mb-6 opacity-90">
                Create your unique cultural style today.
              </p>
              <button
                className="bg-accent hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => (window.location.href = "/profile")}
              >
                Go to Profile <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MetiGuide;
