"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  Languages,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  UserCheck,
} from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [dialect, setDialect] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("User ID not found after signup");
      }

      const { error: dbError } = await supabase.from("users").insert({
        user_id: userId,
        username,
        email,
        role,
        full_name: fullName,
        location,
        dialect,
      });

      if (dbError) throw dbError;

      if (role === "tailor") {
        const { error: tailorError } = await supabase
          .from("tailordetails")
          .insert({
            user_id: userId,
            bio: null,
            rating: 0.0,
          });
        if (tailorError) throw tailorError;
      }

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!email || !password || !repeatPassword || !username) {
        setError("Please fill in all required fields");
        return;
      }
      if (password !== repeatPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }
    setError(null);
    setCurrentStep(2);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(1);
  };

  const dialects = [
    { value: "Indonesia", label: "Indonesia", region: "Indonesia" },
    { value: "Jawa", label: "Jawa", region: "Central & East Java" },
    { value: "Sunda", label: "Sunda", region: "West Java" },
    { value: "Batak", label: "Batak", region: "North Sumatra" },
    { value: "Betawi", label: "Betawi", region: "Jakarta" },
    { value: "Minang", label: "Minang", region: "West Sumatra" },
    { value: "Bugis", label: "Bugis", region: "South Sulawesi" },
    { value: "Madura", label: "Madura", region: "Madura Island" },
    { value: "Bali", label: "Bali", region: "Bali" },
  ];

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-coral-pink rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-serif font-bold">
              Join METI
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Connect with Indonesia&apos;s finest craftspeople
            </CardDescription>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Account</span>
            </div>
            <div
              className={`w-8 h-0.5 ${
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              } transition-colors`}
            ></div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Profile</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-border/50 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters long
                  </p>
                </div>

                {/* Repeat Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="repeat-password"
                    className="text-sm font-medium"
                  >
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="repeat-password"
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-border/50 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRepeatPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full h-12 bg-gradient-coral-pink hover:opacity-90 text-white font-medium text-base rounded-xl shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    I want to join as *
                  </Label>
                  <Select onValueChange={setRole} required>
                    <SelectTrigger
                      id="role"
                      className="h-12 border-border/50 focus:border-primary"
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Customer</div>
                            <div className="text-xs text-muted-foreground">
                              Order custom batik clothing
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="tailor">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-coral/10 rounded-lg flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-coral" />
                          </div>
                          <div>
                            <div className="font-medium">Tailor</div>
                            <div className="text-xs text-muted-foreground">
                              Showcase your craftsmanship
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, Province"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Dialect Selection */}
                <div className="space-y-2">
                  <Label htmlFor="dialect" className="text-sm font-medium">
                    Preferred Dialect *
                  </Label>
                  <Select onValueChange={setDialect} required>
                    <SelectTrigger
                      id="dialect"
                      className="h-12 border-border/50 focus:border-primary"
                    >
                      <SelectValue placeholder="Select your dialect" />
                    </SelectTrigger>
                    <SelectContent>
                      {dialects.map((dialect) => (
                        <SelectItem key={dialect.value} value={dialect.value}>
                          <div className="flex items-center space-x-3">
                            <Languages className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{dialect.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {dialect.region}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1 h-12 border-border/50"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-coral-pink hover:opacity-90 text-white font-medium text-base rounded-xl shadow-lg transition-all duration-200 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Create Account</span>
                        <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </form>

          {/* Footer Links */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <Link
                href="/"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
