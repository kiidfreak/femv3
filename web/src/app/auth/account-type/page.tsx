"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, ArrowRight, Check, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"

export default function AccountTypePage() {
    const router = useRouter()
    const { updateUser } = useAuth()
    const [selected, setSelected] = useState<"member" | "business_owner" | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleContinue = async () => {
        if (!selected) return

        setIsLoading(true)

        try {
            const response = await apiClient.auth.updateProfile({ user_type: selected })
            const data = await response.json()

            if (response.ok) {
                updateUser(data.user)
            }

            if (selected === "member") {
                router.push("/directory")
            } else {
                // Business owners go to onboarding
                router.push("/onboarding/business")
            }
        } catch (error) {
            console.error("Failed to update profile", error)
            setIsLoading(false)
        }
    }

    return (
        <div className="container min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-[#F58220]/10 text-[#F58220] px-4 py-2 rounded-full text-sm font-bold">
                        <Sparkles className="h-4 w-4" />
                        Almost There!
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight">
                        How will you use Faith Connect?
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Choose the option that best describes you. You can always change this later.
                    </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Community Member Option */}
                    <Card
                        onClick={() => setSelected("member")}
                        className={`relative cursor-pointer border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${selected === "member"
                            ? "border-[#F58220] bg-[#F58220]/5 shadow-xl shadow-[#F58220]/20"
                            : "border-gray-200 hover:border-[#F58220]/50"
                            }`}
                    >
                        <CardContent className="p-8 space-y-6">
                            {/* Checkmark */}
                            <div className="absolute top-4 right-4">
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selected === "member"
                                        ? "bg-[#F58220] border-[#F58220]"
                                        : "border-gray-300"
                                        }`}
                                >
                                    {selected === "member" && (
                                        <Check className="h-5 w-5 text-white animate-scale-in" />
                                    )}
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-[#F58220]/20 to-[#F58220]/5 rounded-2xl flex items-center justify-center">
                                <Users className="h-8 w-8 text-[#F58220]" />
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-[#1A1A1A]">Community Member</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Discover and support faith-based businesses in your community
                                </p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3">
                                {[
                                    "Browse trusted Christian businesses",
                                    "Write and read reviews",
                                    "Save favorite places",
                                    "Get exclusive member discounts",
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#F58220]/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <Check className="h-3 w-3 text-[#F58220]" />
                                        </div>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Business Owner Option */}
                    <Card
                        onClick={() => setSelected("business_owner")}
                        className={`relative cursor-pointer border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${selected === "business_owner"
                            ? "border-[#F58220] bg-[#F58220]/5 shadow-xl shadow-[#F58220]/20"
                            : "border-gray-200 hover:border-[#F58220]/50"
                            }`}
                    >
                        <CardContent className="p-8 space-y-6">
                            {/* Checkmark */}
                            <div className="absolute top-4 right-4">
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selected === "business_owner"
                                        ? "bg-[#F58220] border-[#F58220]"
                                        : "border-gray-300"
                                        }`}
                                >
                                    {selected === "business_owner" && (
                                        <Check className="h-5 w-5 text-white animate-scale-in" />
                                    )}
                                </div>
                            </div>

                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-[#F58220]/20 to-[#F58220]/5 rounded-2xl flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-[#F58220]" />
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-[#1A1A1A]">Business Owner</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Grow your faith-based business and connect with believers
                                </p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3">
                                {[
                                    "List your business for free",
                                    "Manage products & services",
                                    "Get verified badge",
                                    "Track customer reviews",
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#F58220]/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <Check className="h-3 w-3 text-[#F58220]" />
                                        </div>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={handleContinue}
                        disabled={!selected || isLoading}
                        className="h-14 px-12 text-lg font-bold bg-[#F58220] hover:bg-[#D66D18] text-white rounded-xl shadow-lg shadow-[#F58220]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed btn-press"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <span>Loading</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                    <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
