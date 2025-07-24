"use client";

import { Button } from "@/components/ui/button";
import Header from "@/components/headers/header";
import {
  ArrowRight,
  Palette,
  Users,
  MessageCircle,
  Ruler,
  Heart,
  Star,
} from "lucide-react";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const tailorsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Parallax effect for hero
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }

      // Fade in animations for sections
      const sections = [featuresRef.current, tailorsRef.current];
      sections.forEach((section) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          if (isVisible) {
            section.classList.add("animate-fade-in-up");
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative bg-gradient-teal-pink text-primary-foreground py-32 px-6 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary-foreground rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-primary-foreground rotate-45 animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-accent font-medium tracking-wide uppercase">
                  Connecting Heritage with Innovation
                </p>
                <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-tight">
                  Weaving
                  <br />
                  <span className="text-accent">Stories</span> into
                  <br />
                  Personalized Batik
                </h1>
              </div>

              <p className="text-xl text-primary-foreground/90 max-w-lg leading-relaxed">
                Bridge the gap between Indonesia&apos;s master tailors and
                modern fashion. Create custom batik clothing with traditional
                craftsmanship and contemporary design.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-6 text-lg font-medium group"
                  onClick={() => handleScrollToSection(featuresRef)}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-full px-8 py-6 text-lg bg-transparent"
                  onClick={() => handleScrollToSection(tailorsRef)}
                >
                  Meet Our Tailors
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-primary-foreground/80">
                    Master Tailors
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-primary-foreground/80">
                    Custom Pieces
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm text-primary-foreground/80">
                    Regions
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/20">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="aspect-square bg-accent rounded-2xl animate-pulse-slow"></div>
                  <div className="aspect-square bg-primary-foreground/20 rounded-2xl animate-pulse-slow-delayed"></div>
                  <div className="aspect-square bg-primary-foreground/20 rounded-2xl animate-pulse-slow-delayed"></div>
                  <div className="aspect-square bg-accent/60 rounded-2xl animate-pulse-slow"></div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-primary-foreground/80 mb-2">
                    Traditional Batik Patterns
                  </div>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <div className="w-3 h-3 bg-primary-foreground/40 rounded-full"></div>
                    <div className="w-3 h-3 bg-primary-foreground/40 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={featuresRef} className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
              How METI Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From design to delivery, experience the seamless journey of
              creating your personalized batik clothing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-3xl bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-teal-pink rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Palette className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">
                Design & Customize
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from traditional batik patterns or create your own. Use
                our body measurement tool for the perfect fit.
              </p>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-coral-pink rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">
                Connect with Tailors
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Get matched with skilled local tailors. Read their stories and
                see their craftsmanship portfolio.
              </p>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">
                Receive & Share
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Get your custom piece and join our community to share stories
                and connect with fellow batik lovers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground">
                Precision Meets
                <br />
                <span className="text-accent">Tradition</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our innovative body measurement technology ensures every piece
                fits perfectly, while preserving the authentic techniques passed
                down through generations.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Ruler className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Smart Body Measurement
                    </h4>
                    <p className="text-muted-foreground">
                      AI-powered measurement tool for perfect fit every time
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Cultural Storytelling
                    </h4>
                    <p className="text-muted-foreground">
                      Learn the history and meaning behind each pattern
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="h-32 bg-primary rounded-2xl"></div>
                    <div className="h-20 bg-accent/60 rounded-2xl"></div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="h-20 bg-coral rounded-2xl"></div>
                    <div className="h-32 bg-primary/60 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailors Showcase */}
      <section
        ref={tailorsRef}
        className="py-24 px-6 bg-primary text-primary-foreground"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
              Meet Our Master Tailors
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Discover the stories and skills of Indonesia&apos;s finest
              craftspeople, from Java to Sumatra, each bringing generations of
              expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "Ibu Sari",
                region: "Yogyakarta",
                experience: "25 years",
                rating: 4.9,
              },
              {
                name: "Pak Budi",
                region: "Solo",
                experience: "30 years",
                rating: 5.0,
              },
              {
                name: "Ibu Dewi",
                region: "Pekalongan",
                experience: "20 years",
                rating: 4.8,
              },
            ].map((tailor, index) => (
              <div
                key={index}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300 group"
              >
                <div className="w-24 h-24 bg-accent rounded-full mx-auto mb-6 group-hover:scale-105 transition-transform"></div>
                <h3 className="text-2xl font-serif font-bold text-center mb-2">
                  {tailor.name}
                </h3>
                <p className="text-primary-foreground/80 text-center mb-4">
                  {tailor.region} • {tailor.experience}
                </p>
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="ml-2 text-sm">{tailor.rating}</span>
                </div>
                <p className="text-primary-foreground/80 text-center text-sm leading-relaxed">
                  &quot;Batik is not just fabric, it&apos;s our heritage woven
                  into every thread.&quot;
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-full px-8 bg-transparent"
            >
              Explore All Tailors
            </Button>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 px-6 bg-coral text-coral-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-8">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-coral-foreground/90 max-w-3xl mx-auto mb-12">
            Connect with fellow batik enthusiasts, share your stories, and
            engage in discussions translated to local Indonesian languages and
            dialects.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">15K+</div>
              <div className="text-coral-foreground/80">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-coral-foreground/80">Local Languages</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-coral-foreground/80">Stories Shared</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-coral-foreground/80">Cultural Patterns</div>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-coral-foreground text-coral hover:bg-coral-foreground/90 rounded-full px-8 py-6 text-lg font-medium"
          >
            Join the Community
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary via-accent to-coral text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-8">
            Ready to Create Your
            <br />
            Perfect Batik?
          </h2>
          <p className="text-xl mb-12 text-white/90">
            Start your journey today and connect with Indonesia&apos;s master
            craftspeople
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium"
            >
              Get Started Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary rounded-full px-8 py-6 text-lg bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-burgundy text-burgundy-foreground py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded"></div>
                <span className="text-2xl font-serif font-bold">METI</span>
              </div>
              <p className="text-burgundy-foreground/80">
                Connecting Indonesia&apos;s heritage with modern fashion through
                personalized batik clothing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Platform</h4>
              <div className="space-y-2 text-burgundy-foreground/80">
                <p>Design Studio</p>
                <p>Find Tailors</p>
                <p>Community</p>
                <p>Stories</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <div className="space-y-2 text-burgundy-foreground/80">
                <p>Help Center</p>
                <p>Size Guide</p>
                <p>Shipping</p>
                <p>Returns</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <div className="space-y-2 text-burgundy-foreground/80">
                <p>hello@meti.co.id</p>
                <p>+62 812 3456 789</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          <div className="border-t border-burgundy-foreground/20 pt-8 text-center text-burgundy-foreground/60">
            <p>&copy; 2024 METI. Preserving heritage, creating futures.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
