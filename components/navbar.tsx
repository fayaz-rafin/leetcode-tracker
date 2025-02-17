"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await fetch("/auth/logout", { method: "POST" });
      window.location.href = "/auth/login";
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/all-problems", label: "All Problems" },
    { href: "#", label: "Statistics" },
  ];

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link className="flex items-center justify-center" href="/">
        <span className="font-bold text-lg">LeetCode Tracker</span>
      </Link>
      <nav className="ml-auto hidden md:flex items-center gap-4 sm:gap-6">
        {user &&
          navItems.map((item) => (
            <Link
              key={item.href}
              className="text-sm font-medium hover:underline underline-offset-4"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        {user ? (
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        ) : (
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
        )}
      </nav>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden ml-auto">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 mt-4">
            {user &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium hover:underline underline-offset-4"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            {user ? (
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
