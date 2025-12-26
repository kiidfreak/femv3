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
    CheckCircle2, AlertCircle, ChevronRight, ShieldAlert, Info, Check
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function UserProfileDropdown() {
    const { user, logout } = useAuth()

    if (!user) return null

    // Helper function to get display label for user type
    const getUserTypeLabel = (userType: string) => {
        const labels: Record<string, string> = {
            'member': 'Community Member',
            'business_owner': 'Business Owner',
            'church_admin': 'Church Admin',
            'system_admin': 'System Admin'
        }
        return labels[userType] || 'Member'
    }

    // Calculate profile completion
    const getProfileCompletion = () => {
        const steps = [
            { label: 'Basic Info', description: 'Add your first name to your profile', completed: !!user.first_name },
            { label: 'Email Address', description: 'Ensure your email is correctly set', completed: !!user.email },
            { label: 'Phone Verification', description: 'Verify your identity via OTP', completed: !!user.phone_verified },
        ]

        if (user.user_type === 'business_owner') {
            steps.push({ label: 'Business Profile', description: 'Provide details about your business', completed: !!user.has_business_profile })
            steps.push({ label: 'Church Verification', description: 'Get verified by the church leadership', completed: !!user.is_verified })
        }

        const completedCount = steps.filter(s => s.completed).length
        const totalCount = steps.length

        return {
            percentage: Math.round((completedCount / totalCount) * 100),
            isComplete: completedCount === totalCount,
            completed: completedCount,
            total: totalCount,
            steps
        }
    }

    const completion = getProfileCompletion()
    const isOnboarding = !completion.isComplete

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 relative">
                    <div className="h-10 w-10 rounded-full bg-[#F58220]/10 flex items-center justify-center relative shadow-sm border border-[#F58220]/20 overflow-hidden">
                        {user.profile_image_url ? (
                            <Image src={user.profile_image_url} alt={user.first_name || "Profile"} fill className="object-cover" />
                        ) : (
                            <User className="h-5 w-5 text-[#F58220]" />
                        )}
                        {isOnboarding && (
                            <div className={cn(
                                "absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center shadow-md",
                                user.user_type === 'business_owner' && !user.is_verified && user.has_business_profile
                                    ? "bg-blue-500" // Verification issue
                                    : "bg-orange-500" // Basic profile issue
                            )}>
                                {user.user_type === 'business_owner' && !user.is_verified && user.has_business_profile ? (
                                    <ShieldAlert className="h-2.5 w-2.5 text-white" />
                                ) : (
                                    <AlertCircle className="h-2.5 w-2.5 text-white" />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-bold text-[#1A1A1A]">
                            {user.first_name || "User"}
                        </span>
                        <span className="text-xs text-gray-500">
                            {getUserTypeLabel(user.user_type)}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                {/* User Info Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-[#F58220]/10 flex items-center justify-center overflow-hidden relative border border-[#F58220]/20">
                            {user.profile_image_url ? (
                                <Image src={user.profile_image_url} alt={user.first_name || "Profile"} fill className="object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-[#F58220]" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-[#1A1A1A]">{user.first_name || user.phone}</p>
                            <p className="text-sm text-gray-500">{getUserTypeLabel(user.user_type)}</p>
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
                            <Progress value={completion.percentage} className="h-2 mb-3" />

                            {/* Detailed Steps Visualization */}
                            <div className="space-y-2 mb-4">
                                {completion.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-2 group relative">
                                        <div className={cn(
                                            "mt-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                                            step.completed ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                        )}>
                                            {step.completed ? (
                                                <Check className="h-2.5 w-2.5" />
                                            ) : (
                                                <Info className="h-2.5 w-2.5" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn(
                                                "text-[10px] font-bold leading-tight",
                                                step.completed ? "text-gray-400" : "text-orange-900"
                                            )}>
                                                {step.label}
                                            </p>
                                            {!step.completed && (
                                                <p className="text-[9px] text-orange-700/70 mt-0.5 transition-all">
                                                    {step.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] text-orange-800 font-medium mb-1">
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
                            <Link href="/dashboard" className="cursor-pointer">
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
                            <Link href="/dashboard/reviews" className="cursor-pointer">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                My Reviews
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
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
