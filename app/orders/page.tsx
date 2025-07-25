"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { Order } from "@/lib/model/order";
import type { User } from "@/lib/model/user";
import Header from "@/components/headers/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Calendar,
  UserIcon,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRole] = useState<"customer" | "tailor" | "loading">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
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

        // Fetch orders
        const ordersRes = await fetch("/api/orders", { method: "GET" });
        if (!ordersRes.ok) {
          setError("Failed to fetch orders");
          return;
        }
        const ordersData: { orders: Order[] } = await ordersRes.json();
        setOrders(ordersData.orders);
      } catch (err) {
        setError("An error occurred");
        console.error(err);
      }
    };

    fetchUserAndOrders();
  }, []);

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <Package className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "delivered":
        return <Truck className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(
      (o) => o.status.toLowerCase() === "pending"
    ).length;
    const inProgress = orders.filter(
      (o) => o.status.toLowerCase() === "in_progress"
    ).length;
    const completed = orders.filter(
      (o) => o.status.toLowerCase() === "completed"
    ).length;

    return { total, pending, inProgress, completed };
  };

  if (role === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Orders Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
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
              You don&apos;t have permission to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-teal-pink rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-title font-bold text-foreground">
              My Orders
            </h1>
          </div>
          <p className="text-muted-foreground font-body text-lg">
            {role === "customer"
              ? "Track your custom batik orders"
              : "Manage your tailoring projects"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card
            className="hover-lift animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-title font-bold text-foreground">
                    {stats.total}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    Total Orders
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-teal-pink rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover-lift animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-title font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    Pending
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover-lift animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-title font-bold text-blue-600">
                    {stats.inProgress}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    In Progress
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover-lift animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-title font-bold text-green-600">
                    {stats.completed}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    Completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-body">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="animate-fade-in-up">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-title font-bold mb-4">
                No orders yet
              </h3>
              <p className="text-muted-foreground mb-6 font-body max-w-md mx-auto">
                {role === "customer"
                  ? "Start your batik journey by placing your first custom order with our master tailors."
                  : "You haven't received any orders yet. Keep showcasing your amazing work!"}
              </p>
              <Button
                onClick={() =>
                  router.push(role === "customer" ? "/tailors" : "/profile")
                }
                className="bg-gradient-teal-pink hover:opacity-90 text-white font-body"
              >
                {role === "customer" ? "Find Tailors" : "View Profile"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <Card
                key={order.order_id}
                className="hover-lift animate-fade-in-up shadow-lg border-0 bg-white/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Order Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-title font-bold text-foreground">
                              Order #{order.order_id.slice(0, 8)}
                            </h2>
                            <Badge
                              className={`${getStatusColor(
                                order.status
                              )} font-body border`}
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status.replace("_", " ").toUpperCase()}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <div className="font-body">
                            <span className="text-sm">Ordered:</span>
                            <p className="font-medium text-foreground">
                              {format(new Date(order.order_date), "PPP")}
                            </p>
                          </div>
                        </div>

                        {order.delivery_date && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Truck className="w-4 h-4 text-green-500" />
                            <div className="font-body">
                              <span className="text-sm">Delivery:</span>
                              <p className="font-medium text-foreground">
                                {format(new Date(order.delivery_date), "PPP")}
                              </p>
                            </div>
                          </div>
                        )}

                        {role === "customer" && order.tailor && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <UserIcon className="w-4 h-4 text-purple-500" />
                            <div className="font-body">
                              <span className="text-sm">Tailor:</span>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">
                                  {order.tailor.full_name}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">
                                    {order.tailor.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {role === "tailor" && order.customer && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <UserIcon className="w-4 h-4 text-purple-500" />
                            <div className="font-body">
                              <span className="text-sm">Customer:</span>
                              <p className="font-medium text-foreground">
                                {order.customer.full_name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => handleViewDetails(order.order_id)}
                        className="bg-gradient-teal-pink hover:opacity-90 text-white px-6 py-3 rounded-xl font-body group"
                      >
                        View Details
                        <Package className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {orders.length > 0 && (
          <Card className="mt-12 bg-gradient-coral-pink text-white border-0 animate-fade-in-up">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-title font-bold mb-4">
                {role === "customer"
                  ? "Ready for Another Custom Piece?"
                  : "Expand Your Craft"}
              </h3>
              <p className="text-white/90 mb-6 font-body max-w-2xl mx-auto">
                {role === "customer"
                  ? "Discover more talented tailors and create unique batik pieces that tell your story."
                  : "Connect with more customers and showcase your traditional batik craftsmanship."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
