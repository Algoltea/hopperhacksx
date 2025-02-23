"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { logoutUser } from "@/lib/auth/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f4f0e5] overflow-hidden">
      <nav className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm flex-none">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo Image */}
            <img
                src="/hopperhelps_logo.png" // Ensure the logo is in the public folder
                alt="HopperHelps Logo"
                className="w-20 h-15" // Wider logo
              />
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 py-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
}