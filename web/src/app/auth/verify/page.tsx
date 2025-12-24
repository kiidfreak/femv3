"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

function VerifyOTPContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { verifyOtp, isLoading } = useAuth()
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const identifier = searchParams.get("identifier") || searchParams.get("phone")

    useEffect(() => {
        if (!identifier) {
            router.push("/auth/login")
        }
    }, [identifier, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit code")
            return
        }

        try {
            const user = await verifyOtp(identifier!, otp)

            // Intelligent Redirect based on User Type & Profile Status
            if (user.user_type === 'business_owner') {
                if (user.has_business_profile) {
                    router.push("/dashboard")
                } else {
                    router.push("/onboarding/business")
                }
            } else {
                // Community members (and default users) go to directory/home
                router.push("/")
            }
        } catch (err: any) {
            setError(err.message || "Invalid or expired OTP")
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white animate-fade-in-up">
                <CardHeader className="space-y-4 text-center pb-2">
                    <div className="mx-auto bg-[#F58220]/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                        <ShieldCheck className="h-8 w-8 text-[#F58220]" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Verify Your Identity</CardTitle>
                    <CardDescription className="text-gray-500 text-lg">
                        We've sent a 6-digit code to <br />
                        <span className="font-bold text-[#1A1A1A]">{identifier}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                id="otp"
                                placeholder="000000"
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="text-center text-4xl tracking-[1em] h-16 font-mono border-gray-100 focus:border-[#F58220] focus:ring-[#F58220] transition-all"
                                disabled={isLoading}
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold bg-[#F58220] hover:bg-[#D66D18] text-white rounded-xl shadow-lg shadow-[#F58220]/20 transition-all hover:scale-[1.02] active:scale-[0.98] btn-press"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Verifying</span>
                                    <div className="flex gap-1 ml-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                    </div>
                                </div>
                            ) : "Verify & Continue"}
                        </Button>

                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-500">
                                Didn't receive the code?{" "}
                                <button type="button" className="text-[#F58220] font-bold hover:underline">
                                    Resend OTP
                                </button>
                            </p>

                            <Link
                                href="/auth/login"
                                className="inline-flex items-center text-sm text-gray-400 hover:text-[#1A1A1A] transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Try a different number
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#F58220]" />
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    )
}
