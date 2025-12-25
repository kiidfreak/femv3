"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm transition-all duration-300">
      <div className="container flex h-24 items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center space-x-2">
          {/* Logo container with generous padding/hover effect */}
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

        {/* Desktop Navigation - Centered & Rounded */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <Link href="/" className={cn(navigationMenuTriggerStyle(), "h-12 px-6 rounded-full text-lg font-medium hover:bg-orange-50 hover:text-[#F58220] transition-colors")}>
                  Home
                </Link>
              </NavigationMenuItem>

              {user?.user_type === "business_owner" ? (
                <NavigationMenuItem>
                  <Link href="/dashboard" className={cn(navigationMenuTriggerStyle(), "h-12 px-6 rounded-full text-lg font-medium hover:bg-orange-50 hover:text-[#F58220] transition-colors")}>
                    Dashboard
                  </Link>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem>
                  <Link href="/directory" className={cn(navigationMenuTriggerStyle(), "h-12 px-6 rounded-full text-lg font-medium hover:bg-orange-50 hover:text-[#F58220] transition-colors")}>
                    Directory
                  </Link>
                </NavigationMenuItem>
              )}

              <NavigationMenuItem>
                <Link href="/about" className={cn(navigationMenuTriggerStyle(), "h-12 px-6 rounded-full text-lg font-medium hover:bg-orange-50 hover:text-[#F58220] transition-colors")}>
                  About
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact" className={cn(navigationMenuTriggerStyle(), "h-12 px-6 rounded-full text-lg font-medium hover:bg-orange-50 hover:text-[#F58220] transition-colors")}>
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <UserProfileDropdown />
          ) : (
            <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  )
}
