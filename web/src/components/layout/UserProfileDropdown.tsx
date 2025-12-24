"use client"

import { useState } from "react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    User, Building2, LayoutDashboard, Settings, LogOut,
    CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react"
import { useAuth } from "@/lib/auth"

export function UserProfileDropdown() {
    const { user, logout } = useAuth()

    if (!user) return null

    // Calculate profile completion
    const getProfileCompletion = () => {
        let completed = 0
        const total = user.user_type === 'business_owner' ? 5 : 3

        if (user.first_name) completed++
        if (user.email) completed++
        if (user.phone_verified) completed++

        if (user.user_type === 'business_owner') {
            if (user.has_business_profile) completed++
            if (user.is_verified) completed++
        }

        return {
            percentage: Math.round((completed / total) * 100),
            isComplete: completed === total,
            completed,
            total
        }
    }

    const completion = getProfileCompletion()
    const isOnboarding = !completion.isComplete

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 relative">
                    <div className="h-10 w-10 rounded-full bg-[#F58220]/10 flex items-center justify-center relative">
                        <User className="h-5 w-5 text-[#F58220]" />
                        {isOnboarding && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">!</span>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-bold text-[#1A1A1A]">
                            {user.first_name || "User"}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                            {user.user_type.replace('_', ' ')}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                {/* User Info Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-[#F58220]/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-[#F58220]" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-[#1A1A1A]">{user.first_name || user.phone}</p>
                            <p className="text-sm text-gray-500 capitalize">{user.user_type.replace('_', ' ')}</p>
                        </div>
                    </div>

                    {/* Profile Completion - Show during onboarding */}
                    {isOnboarding && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-orange-900">
                                    Complete Your Profile
                                </span>
                                <span className="text-xs font-bold text-orange-600">
                                    {completion.percentage}%
                                </span>
                            </div>
                            <Progress value={completion.percentage} className="h-2 mb-2" />
                            <p className="text-xs text-orange-800">
                                {completion.completed} of {completion.total} steps completed
                            </p>
                            <Link href={user.user_type === 'business_owner' ? '/onboarding/business' : '/onboarding/profile'}>
                                <Button
                                    size="sm"
                                    className="w-full mt-2 bg-[#F58220] hover:bg-[#D66D18] text-white h-8 text-xs"
                                >
                                    Continue Setup <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Completion Badge - Show after onboarding */}
                    {completion.isComplete && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-bold text-green-900">Profile Complete</span>
                        </div>
                    )}
                </div>

                {/* Verification Status - Business Owners Only */}
                {user.user_type === 'business_owner' && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-3">
                            {user.is_verified ? (
                                <div className="flex items-center gap-2 text-xs text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="font-bold">Church Verified</span>
                                </div>
                            ) : (
                                <Link href="/admin/verifications/apply">
                                    <div className="flex items-center gap-2 text-xs text-orange-600 cursor-pointer hover:text-orange-700">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="font-bold">Apply for Verification</span>
                                        <ChevronRight className="h-3 w-3 ml-auto" />
                                    </div>
                                </Link>
                            )}
                        </div>
                    </>
                )}

                <DropdownMenuSeparator />

                {/* Navigation Links */}
                {user.user_type === 'business_owner' ? (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="cursor-pointer">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/my-business" className="cursor-pointer">
                                <Building2 className="mr-2 h-4 w-4" />
                                My Business
                            </Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/favorites" className="cursor-pointer">
                                <Building2 className="mr-2 h-4 w-4" />
                                My Favorites
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/reviews" className="cursor-pointer">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                My Reviews
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer font-bold">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </DropdownMenuItem>

                {/* Footer Note */}
                {isOnboarding && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-3 bg-gray-50">
                            <p className="text-xs text-gray-500 text-center">
                                Complete your profile to unlock all features
                            </p>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
