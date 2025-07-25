"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import type { Order } from "@/lib/model/order";
import type { User } from "@/lib/model/user";
import Header from "@/components/headers/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Calendar,
  UserIcon,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeft,
  AlertCircle,
  Ruler,
  Palette,
  MapPin,
  Mail,
  Award,
  Eye,
} from "lucide-react";

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [role, setRole] = useState<"customer" | "tailor" | "loading">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  useEffect(() => {
    const fetchUserAndOrder = async () => {
      try {
        // Fetch user role
        const userRes = await fetch("/api/user", { method: "GET" });
        if (!userRes.ok) {
          setError("Failed to fetch user data");
          setRole("loading");
          return;
        }
        const userData: { user: User } = await userRes.json();
        setRole(userData.user.role);

        // Fetch order details
        const orderRes = await fetch(`/api/orders/${orderId}`, {
          method: "GET",
        });
        if (!orderRes.ok) {
          setError("Failed to fetch order details");
          return;
        }
        const orderData: { order: Order } = await orderRes.json();
        setOrder(orderData.order);
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      }
    };

    fetchUserAndOrder();
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "in_progress":
        return <Package className="w-5 h-5" />;
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      case "delivered":
        return <Truck className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return 25;
      case "in_progress":
        return 50;
      case "completed":
        return 75;
      case "delivered":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const handleCancelOrder = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to cancel order");
        return;
      }
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    } catch (err) {
      setError("An error occurred while cancelling");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to confirm delivery");
        return;
      }
      const data: { order: Order } = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError("An error occurred while confirming");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to complete order");
        return;
      }
      const data: { order: Order } = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError("An error occurred while completing");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (role === "loading" || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64" />
          </div>

          {/* Progress Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-2 w-full mb-4" />
              <div className="flex justify-between">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role !== "customer" && role !== "tailor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-title font-bold mb-2">Unauthorized</h2>
            <p className="text-muted-foreground font-body">
              You don&apos;t have permission to view this order.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 font-body"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-teal-pink rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-title font-bold text-foreground">
                Order #{order.order_id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground font-body">
                Created {format(new Date(order.created_at), "PPP")}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 animate-fade-in-up">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-body">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Tracker */}
        <Card
          className="mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-title">
                <Clock className="w-5 h-5 text-blue-500" />
                Order Progress
              </CardTitle>
              <Badge
                className={`${getStatusColor(order.status)} font-body border`}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status.replace("_", " ").toUpperCase()}
                </div>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-teal-pink h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between">
                {["Pending", "In Progress", "Completed", "Delivered"].map(
                  (step, index) => {
                    const isActive = index < progressPercentage / 25;
                    const isCurrent =
                      index === Math.floor(progressPercentage / 25) - 1;
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive
                              ? "bg-gradient-teal-pink border-transparent text-white"
                              : isCurrent
                              ? "border-blue-500 text-blue-500"
                              : "border-gray-300 text-gray-400"
                          }`}
                        >
                          {index === 0 && <Clock className="w-5 h-5" />}
                          {index === 1 && <Package className="w-5 h-5" />}
                          {index === 2 && <CheckCircle className="w-5 h-5" />}
                          {index === 3 && <Truck className="w-5 h-5" />}
                        </div>
                        <span className="text-xs font-body mt-2 text-center">
                          {step}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-title">
                  <Package className="w-5 h-5 text-blue-500" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <div className="font-body">
                      <span className="text-sm text-muted-foreground">
                        Order Date:
                      </span>
                      <p className="font-medium">
                        {format(new Date(order.order_date), "PPP")}
                      </p>
                    </div>
                  </div>
                  {order.delivery_date && (
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-purple-500" />
                      <div className="font-body">
                        <span className="text-sm text-muted-foreground">
                          Delivery Date:
                        </span>
                        <p className="font-medium">
                          {format(new Date(order.delivery_date), "PPP")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card
              className="animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-title">
                  <UserIcon className="w-5 h-5 text-green-500" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <Image
                      src={
                        order.customer!.profile_picture_url ||
                        "/placeholder.svg"
                      }
                      width={80}
                      height={80}
                      alt={order.customer!.full_name || "Customer"}
                      className="rounded-full ring-4 ring-white shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-title font-bold mb-1">
                      {order.customer!.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Mail className="w-4 h-4" />
                      <span className="font-body text-sm">
                        {order.customer!.email}
                      </span>
                    </div>
                    {order.customer!.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="font-body text-sm">
                          {order.customer!.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-title font-semibold mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-orange-500" />
                    Body Measurements
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between font-body">
                        <span className="text-muted-foreground">
                          Right Arm:
                        </span>
                        <span className="font-medium">
                          {order.customer!.right_arm_length || "N/A"} cm
                        </span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="text-muted-foreground">Left Arm:</span>
                        <span className="font-medium">
                          {order.customer!.left_arm_length || "N/A"} cm
                        </span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="text-muted-foreground">
                          Shoulder Width:
                        </span>
                        <span className="font-medium">
                          {order.customer!.shoulder_width || "N/A"} cm
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-body">
                        <span className="text-muted-foreground">
                          Upper Body:
                        </span>
                        <span className="font-medium">
                          {order.customer!.upper_body_height || "N/A"} cm
                        </span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="text-muted-foreground">
                          Hip Width:
                        </span>
                        <span className="font-medium">
                          {order.customer!.hip_width || "N/A"} cm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tailor Information */}
            <Card
              className="animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-title">
                  <Award className="w-5 h-5 text-purple-500" />
                  Tailor Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Image
                      src={
                        order.tailor!.profile_picture_url || "/placeholder.svg"
                      }
                      width={80}
                      height={80}
                      alt={order.tailor!.full_name || "Tailor"}
                      className="rounded-full ring-4 ring-white shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-title font-bold mb-1">
                      {order.tailor!.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-body font-medium">
                        {order.tailor!.rating}/5
                      </span>
                      <Badge variant="outline" className="ml-2 font-body">
                        Master Craftsperson
                      </Badge>
                    </div>
                    {order.tailor!.bio && (
                      <p className="text-muted-foreground font-body text-sm leading-relaxed">
                        {order.tailor!.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Design Preview */}
            <Card
              className="animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-title">
                  <Palette className="w-5 h-5 text-pink-500" />
                  Design Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <Image
                    src={order.design_url || "/placeholder.svg"}
                    width={300}
                    height={300}
                    alt="Order Design"
                    className="w-full rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors duration-300 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-body"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Size
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card
              className="animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <CardHeader>
                <CardTitle className="font-title">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(role === "customer" || role === "tailor") &&
                  order.status === "pending" && (
                    <Button
                      onClick={handleCancelOrder}
                      disabled={isProcessing}
                      variant="destructive"
                      className="w-full font-body"
                    >
                      {isProcessing ? "Cancelling..." : "Cancel Order"}
                    </Button>
                  )}

                {role === "tailor" && order.status === "pending" && (
                  <Button
                    onClick={handleConfirmDelivery}
                    disabled={isProcessing}
                    className="w-full bg-gradient-teal-pink hover:opacity-90 text-white font-body"
                  >
                    {isProcessing ? "Confirming..." : "Confirm & Start Work"}
                  </Button>
                )}

                {role === "tailor" && order.status === "in_progress" && (
                  <Button
                    onClick={handleCompleteOrder}
                    disabled={isProcessing}
                    className="w-full bg-gradient-coral-pink hover:opacity-90 text-white font-body"
                  >
                    {isProcessing ? "Completing..." : "Mark as Complete"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full font-body bg-transparent"
                >
                  Contact {role === "customer" ? "Tailor" : "Customer"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
