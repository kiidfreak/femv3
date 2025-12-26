"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, Home, Store, Info, PhoneCall, LayoutDashboard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useAuth } from "@/lib/auth"
import { UserProfileDropdown } from "./UserProfileDropdown"

export function Navbar() {
  const { user } = useAuth()

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    ...(user?.user_type === "business_owner" ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    { href: "/directory", label: "Directory", icon: Store },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: PhoneCall },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm transition-all duration-300">
      <div className="container flex h-24 items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center space-x-2">
          <div className="p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <Image
              src="/logo.png"
              alt="Faith Connect"
              width={200}
              height={50}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link href={link.href} className={cn(navigationMenuTriggerStyle(), "h-12 px-6 rounded-full text-lg font-medium hover:bg-orange-50 hover:text-[#F58220] transition-colors")}>
                    {link.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Actions & Mobile Trigger */}
        <div className="flex items-center space-x-4">
          {user ? (
            <UserProfileDropdown />
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="h-12 px-6 rounded-full text-lg font-medium hover:bg-orange-50 hover:text-[#F58220]">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="h-12 px-8 rounded-full bg-[#F58220] hover:bg-[#D66D18] text-white text-lg font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all">
                  Join Now
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-12 w-12 rounded-xl hover:bg-orange-50 text-[#F58220]">
                <Menu className="h-8 w-8" />
              </Button>
            </DialogTrigger>
            <DialogContent className="fixed inset-y-0 right-0 left-auto h-full w-[300px] translate-x-0 translate-y-0 border-l bg-white p-0 shadow-2xl transition-transform data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:rounded-none">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <span className="text-[#F58220]">Faith</span> Connect
                  </DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-4 p-4 rounded-xl text-lg font-bold text-gray-700 hover:bg-orange-50 hover:text-[#F58220] transition-colors"
                    >
                      <link.icon className="h-6 w-6" />
                      {link.label}
                    </Link>
                  ))}

                  {!user && (
                    <div className="pt-4 space-y-3">
                      <Link href="/auth/login" className="block w-full">
                        <Button variant="outline" className="w-full h-14 rounded-xl text-lg font-bold">Login</Button>
                      </Link>
                      <Link href="/auth/signup" className="block w-full">
                        <Button className="w-full h-14 rounded-xl bg-[#F58220] hover:bg-[#D66D18] text-white text-lg font-bold">Join Now</Button>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t bg-gray-50">
                  <p className="text-sm text-center text-gray-500 font-medium italic">
                    Connecting the faithful through trusted business.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
