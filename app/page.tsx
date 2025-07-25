"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/headers/header";
import {
  Star,
  ArrowRight,
  Heart,
  Ruler,
  Palette,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

// Updated Batik Pattern Components using your SVGs
const BatikWaveTeal = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/assets/Asset_6.svg"
      alt="Batik Wave Pattern"
      fill
      className="object-contain"
    />
  </div>
);

const BatikWaveOrange = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/assets/Asset_5.svg"
      alt="Batik Wave Pattern"
      fill
      className="object-contain"
    />
  </div>
);

const BatikWavePink = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/assets/Asset_4.svg"
      alt="Batik Wave Pattern"
      fill
      className="object-contain"
    />
  </div>
);

const BatikFlowerOrange = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/assets/Asset_2.svg"
      alt="Batik Flower Pattern"
      fill
      className="object-contain"
    />
  </div>
);

const BatikFlowerPink = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/assets/Asset_3.svg"
      alt="Batik Flower Pattern"
      fill
      className="object-contain"
    />
  </div>
);

const BatikFlowerBlue = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/assets/Asset_8.svg"
      alt="Batik Flower Pattern"
      fill
      className="object-contain"
    />
  </div>
);

const slides = [
  {
    desktop:
      "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/slider/Home_1.png",
    mobile:
      "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/wallpaper_mobile_dummy.png",
    title: "WEAVING",
    description:
      "Discover the ancient art of Indonesian weaving brought to life through modern technology. Connect with master artisans who carry centuries of traditional knowledge.",
  },
  {
    desktop:
      "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/slider/Home_2.png",
    mobile:
      "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/wallpaper_mobile_dummy.png",
    title: "PERSONALIZED",
    description:
      "Create unique batik designs tailored to your style and measurements. Our advanced technology ensures every piece fits perfectly and reflects your personal taste.",
  },
  {
    desktop:
      "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/slider/Home_3.png",
    mobile:
      "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/wallpaper_mobile_dummy.png",
    title: "APPAREL",
    description:
      "Transform traditional Indonesian batik into contemporary fashion. Each garment tells a story of cultural heritage while meeting modern style standards.",
  },
];

export default function HomePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".intersection-fade");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className={"min-h-screen bg-meti-cream"}>
      {/* Header Section with Image Slider */}
      <header className="relative overflow-hidden min-h-screen">
        <Header />

        {/* Image Slider */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Desktop Image */}
              <img
                src={slide.desktop || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="hidden md:block w-full h-full object-cover"
              />
              {/* Mobile Image */}
              <img
                src={slide.mobile || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="md:hidden w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-meti-teal/60"></div>
            </div>
          ))}
        </div>

        {/* Slider Content */}
        <div className="relative z-10 px-12 pb-24 pt-8 min-h-screen flex items-center">
          <div className="max-w-6xl mx-auto relative w-full">
            {/* Simplified Title */}
            <div className="relative text-center">
              <h1
                key={`title-${currentSlide}`}
                className="text-white font-serif leading-none text-7xl md:text-8xl mb-8 animate-fade-in-up opacity-0 [animation-delay:0.2s]"
              >
                {slides[currentSlide].title}
              </h1>

              {/* Body Text */}
              <p
                key={`desc-${currentSlide}`}
                className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto animate-fade-in-up opacity-0 [animation-delay:0.4s] leading-relaxed"
              >
                {slides[currentSlide].description}
              </p>
            </div>
          </div>
        </div>

        {/* Slider Navigation */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Enhanced Scrolling Text Banner */}
      <div className="bg-white border-y border-gray-200 py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap text-xl font-medium text-meti-dark">
          {/* Text is wrapped in a span and duplicated for a seamless loop */}
          <span className="mx-4">
            Custom Batik Designs • Body Measurement Technology • Local
            Indonesian Tailors • Traditional Craftsmanship • Multilingual
            Support • Cultural Heritage •
          </span>
          <span className="mx-4">
            Custom Batik Designs • Body Measurement Technology • Local
            Indonesian Tailors • Traditional Craftsmanship • Multilingual
            Support • Cultural Heritage •
          </span>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="bg-meti-cream py-24 relative overflow-hidden">
        {/* Background Batik Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <BatikWaveTeal className="w-full h-full relative" />
        </div>

        <div className="container mx-auto px-12 relative z-10">
          <div className="text-center mb-16 intersection-fade">
            <h2 className="text-4xl font-serif text-meti-dark mb-4">
              How METI Works
            </h2>
            <p className="text-meti-dark/70 max-w-2xl mx-auto">
              Experience the future of traditional craftsmanship through our
              innovative platform that connects you directly with
              Indonesia&apos;s master tailors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Ruler,
                title: "Measure Yourself",
                description:
                  "Use our advanced body measurement technology to get precise measurements from the comfort of your home.",
              },
              {
                icon: Palette,
                title: "Design Your Batik",
                description:
                  "Choose from traditional patterns or create custom designs. Our platform translates your vision into detailed patterns for tailors.",
              },
              {
                icon: MessageCircle,
                title: "Connect with Artisans",
                description:
                  "Work directly with skilled Indonesian tailors. Share stories, discuss details, and follow your creation's journey.",
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="text-center intersection-fade hover-lift relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-20 h-20 bg-meti-teal rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-meti-pink transition-colors duration-300 relative overflow-hidden">
                  <step.icon className="w-10 h-10 text-white relative z-10" />
                  <div className="absolute inset-0 opacity-20">
                    <BatikFlowerPink className="w-full h-full relative" />
                  </div>
                </div>
                <h3 className="text-xl font-serif text-meti-dark mb-4">
                  {step.title}
                </h3>
                <p className="text-meti-dark/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Batik Elements */}
        <div className="absolute top-20 right-20 w-16 h-16 animate-float opacity-30">
          <BatikFlowerOrange className="w-full h-full relative" />
        </div>
        <div className="absolute bottom-20 left-20 w-12 h-12 animate-float-delayed opacity-30">
          <BatikFlowerPink className="w-full h-full relative" />
        </div>
      </section>

      {/* Featured Batik Designs Section */}
      <section className="bg-white py-24 relative">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16 intersection-fade">
            <h2 className="text-4xl font-serif text-meti-dark mb-4">
              Featured Batik Creations
            </h2>
            <p className="text-meti-dark/70 max-w-2xl mx-auto">
              Discover unique batik designs created through collaboration
              between our customers and talented Indonesian artisans.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Parang Rusak Modern",
                tailor: "Pak Suharto, Yogyakarta",
                price: "Rp 850.000",
                image: "/assets/dummy_batik_1.jpg",
              },
              {
                name: "Kawung Contemporary",
                tailor: "Bu Sari, Solo",
                price: "Rp 750.000",
              },
              {
                name: "Mega Mendung Fusion",
                tailor: "Pak Budi, Cirebon",
                price: "Rp 920.000",
              },
            ].map((item, index) => (
              <div
                key={item.name}
                className="group cursor-pointer intersection-fade hover-lift relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="aspect-[3/4] bg-white mb-4 relative overflow-hidden rounded-lg border">
                  <img
                    src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/dummy_tailor.jpg"
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-meti-teal/0 group-hover:bg-meti-teal/20 transition-colors duration-300"></div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Heart className="w-6 h-6 text-meti-pink hover:fill-current transition-colors cursor-pointer" />
                  </div>
                  {/* Batik corner decoration */}
                  <div className="absolute bottom-2 left-2 w-8 h-8 opacity-60">
                    <BatikFlowerPink className="w-full h-full relative" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-meti-dark group-hover:text-meti-teal transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-meti-dark/60">
                    Crafted by {item.tailor}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-meti-dark/60">
                      (18 reviews)
                    </span>
                  </div>
                  <p className="font-semibold text-meti-dark">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Batik Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 animate-float opacity-20">
          <BatikWaveTeal className="w-full h-full relative" />
        </div>
      </section>

      {/* Support Indonesian Tailors Section */}
      <section className="bg-meti-orange relative overflow-hidden">
        <div className="container mx-auto px-12 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 intersection-fade">
              <h2 className="text-white text-5xl font-serif leading-tight">
                Empowering
                <br />
                Indonesian Tailors
              </h2>
              <p className="text-white text-base leading-relaxed max-w-md">
                Every order directly supports local Indonesian artisans and
                their families. We provide a platform for talented tailors to
                showcase their skills, share their stories, and connect with
                customers worldwide while preserving traditional batik
                techniques.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-6 h-6">
                    <BatikFlowerPink className="w-full h-full relative" />
                  </div>
                  <span>Direct connection with master tailors</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-6 h-6">
                    <BatikFlowerPink className="w-full h-full relative" />
                  </div>
                  <span>Fair compensation for artisans</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-6 h-6">
                    <BatikFlowerPink className="w-full h-full relative" />
                  </div>
                  <span>Preservation of traditional techniques</span>
                </div>
              </div>
              <button className="bg-white text-meti-orange px-8 py-3 font-medium hover:bg-white/90 transition-all duration-300 flex items-center space-x-2 hover-lift group">
                <span>MEET OUR TAILORS</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 intersection-fade">
              <div className="aspect-square relative overflow-hidden rounded-lg hover-lift">
                <img
                  src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/dummy_tailor.jpg"
                  alt="Indonesian tailor at work"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-meti-teal/10 hover:bg-meti-teal/20 transition-colors duration-300"></div>
              </div>
              <div className="aspect-square relative overflow-hidden rounded-lg hover-lift">
                <img
                  src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/dummy_tailor.jpg"
                  alt="Traditional batik making"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-meti-pink/10 hover:bg-meti-pink/20 transition-colors duration-300"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated decorative curved element with batik pattern */}
        <div className="absolute bottom-0 right-0 w-64 h-32 opacity-20 animate-float">
          <BatikWaveOrange className="w-full h-full relative" />
        </div>

        {/* Floating Batik Elements */}
        <div className="absolute top-20 left-20 w-16 h-16 animate-float opacity-30">
          <BatikFlowerOrange className="w-full h-full relative" />
        </div>
      </section>

      {/* Cultural Heritage Section */}
      <section className="bg-meti-cream relative py-24">
        <div className="container mx-auto px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-6 intersection-fade">
              <div className="aspect-square relative overflow-hidden rounded-lg hover-lift">
                <img
                  src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/dummy_tailor.jpg"
                  alt="Traditional batik patterns"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-meti-teal/20 hover:bg-meti-teal/30 transition-colors duration-300"></div>
              </div>
              <div className="aspect-square relative overflow-hidden rounded-lg hover-lift">
                <img
                  src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/dummy_tailor.jpg"
                  alt="Batik craftsmanship"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-meti-pink/20 hover:bg-meti-pink/30 transition-colors duration-300"></div>
              </div>
            </div>

            <div className="space-y-8 intersection-fade">
              <h2 className="text-meti-dark text-5xl font-serif leading-tight">
                Preserving
                <br />
                Cultural Heritage
              </h2>
              <p className="text-meti-dark/70 leading-relaxed">
                Join our mission to preserve Indonesia&apos;s rich batik
                heritage while embracing modern technology. Our platform
                features multilingual support with local dialect translation,
                enabling meaningful conversations between customers and artisans
                across cultural boundaries.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-meti-dark">
                  <div className="w-6 h-6">
                    <BatikFlowerBlue className="w-full h-full relative" />
                  </div>
                  <span>Traditional batik patterns and techniques</span>
                </div>
                <div className="flex items-center space-x-3 text-meti-dark">
                  <div className="w-6 h-6">
                    <BatikFlowerBlue className="w-full h-full relative" />
                  </div>
                  <span>Multilingual communication platform</span>
                </div>
                <div className="flex items-center space-x-3 text-meti-dark">
                  <div className="w-6 h-6">
                    <BatikFlowerBlue className="w-full h-full relative" />
                  </div>
                  <span>Local dialect translation support</span>
                </div>
              </div>
              <button className="bg-meti-teal text-white px-8 py-3 font-medium hover:bg-meti-teal/90 transition-all duration-300 flex items-center space-x-2 hover-lift group">
                <span>EXPLORE HERITAGE</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Animated decorative elements with batik patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20">
          <div className="absolute top-20 right-20 w-32 h-32 animate-float">
            <BatikWaveTeal className="w-full h-full relative" />
          </div>
          <div className="absolute top-40 right-40 w-24 h-24 animate-float-delayed">
            <BatikFlowerBlue className="w-full h-full relative" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-32 animate-pulse-slow">
          <BatikWavePink className="w-full h-full relative" />
        </div>
      </section>

      {/* Indonesian Artisans Gallery Section */}
      <section className="bg-meti-teal py-24 relative overflow-hidden">
        {/* Background Batik Pattern */}
        <div className="absolute inset-0 opacity-10">
          <BatikWaveOrange className="w-full h-full relative" />
        </div>

        <div className="container mx-auto px-12 text-center relative z-10">
          <h2 className="text-white text-5xl font-serif mb-8 leading-tight intersection-fade">
            Meet Indonesia&apos;s
            <br />
            Master Artisans
          </h2>

          {/* Enhanced Infinite Scrolling Gallery */}
          <div className="overflow-hidden mb-16 intersection-fade">
            <div className="flex animate-gallery-scroll space-x-6">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-48 relative overflow-hidden group cursor-pointer rounded-lg"
                >
                  <img
                    src="https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/dummy/dummy_tailor.jpg"
                    alt={`Indonesian artisan ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                    <span className="text-white font-medium bg-meti-pink px-4 py-2 rounded-full">
                      View Profile
                    </span>
                  </div>
                  {/* Batik corner decoration */}
                  <div className="absolute top-2 right-2 w-6 h-6 opacity-60">
                    <BatikFlowerPink className="w-full h-full relative" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white text-base mb-12 max-w-lg mx-auto leading-relaxed intersection-fade">
            Connect with skilled Indonesian tailors from Yogyakarta, Solo,
            Cirebon, and beyond. Each artisan brings generations of batik
            expertise and unique regional techniques.
          </p>

          <button className="text-white text-xl font-medium border-b-2 border-white pb-2 hover:border-meti-pink hover:text-meti-pink transition-all duration-300 flex items-center space-x-2 mx-auto group intersection-fade">
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Floating Batik Elements */}
        <div className="absolute top-20 right-20 w-20 h-20 animate-float opacity-30">
          <BatikWaveTeal className="w-full h-full relative" />
        </div>
        <div className="absolute bottom-20 left-20 w-16 h-16 animate-float-delayed opacity-30">
          <BatikFlowerPink className="w-full h-full relative" />
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-white py-24 relative">
        <div className="container mx-auto px-12 text-center intersection-fade">
          <h2 className="text-3xl font-serif text-meti-dark mb-4">
            Join Our Community
          </h2>
          <p className="text-meti-dark/70 mb-8 max-w-md mx-auto">
            Connect with fellow batik enthusiasts and Indonesian artisans. Share
            your designs, learn about traditional techniques, and be part of
            preserving cultural heritage.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-meti-teal transition-colors duration-300 rounded-l-lg"
            />
            <button className="bg-meti-teal text-white px-8 py-3 font-medium hover:bg-meti-teal/90 transition-all duration-300 rounded-r-lg hover-lift">
              Join Community
            </button>
          </div>
        </div>

        {/* Decorative Batik Elements */}
        <div className="absolute top-10 right-10 w-12 h-12 animate-float opacity-20">
          <BatikFlowerOrange className="w-full h-full relative" />
        </div>
        <div className="absolute bottom-10 left-10 w-16 h-16 animate-float-delayed opacity-20">
          <BatikFlowerPink className="w-full h-full relative" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-meti-dark text-white py-16 relative overflow-hidden">
        {/* Background Batik Pattern */}
        <div className="absolute inset-0 opacity-5">
          <BatikWaveTeal className="w-full h-full relative" />
        </div>

        <div className="container mx-auto px-12 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12 intersection-fade">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-meti-pink rounded flex items-center justify-center animate-pulse-slow relative overflow-hidden">
                  <span className="text-white font-bold text-lg relative z-10">
                    M
                  </span>
                  <div className="absolute inset-0 opacity-30">
                    <BatikFlowerPink className="w-full h-full relative" />
                  </div>
                </div>
                <span className="text-white font-bold text-2xl">METI</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Connecting Indonesian artisans with the world through technology
                and tradition.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-white/70">
                {[
                  "Custom Design",
                  "Body Measurement",
                  "Find Tailors",
                  "Community",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-white/70">
                {[
                  "Our Mission",
                  "Indonesian Artisans",
                  "Cultural Heritage",
                  "Technology",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>hello@meti.co.id</p>
                <p>+62 812 3456 789</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center intersection-fade">
            <p className="text-sm text-white/70">
              © 2024 METI. Preserving Indonesian heritage through innovation.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
