"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2, Phone, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { useEffect } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, loading, user } = useAuth()
    const [identifier, setIdentifier] = useState("")
    const [method, setMethod] = useState<"phone" | "email">("phone")
    const [rememberMe, setRememberMe] = useState(true)

    // Redirect if already authenticated
    useEffect(() => {
        if (user) {
            const redirect = searchParams.get('redirect') || '/dashboard'
            router.push(redirect)
        }
    }, [user, router, searchParams])

    const [errors, setErrors] = useState<{ identifier?: string }>({})

    const validate = () => {
        const newErrors: { identifier?: string } = {}
        if (!identifier) {
            newErrors.identifier = `${method === "phone" ? "Phone number" : "Email"} is required`
        } else {
            if (method === "email") {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
                    newErrors.identifier = "Invalid email address"
                }
            } else {
                // Phone validation for Kenya
                // Allow formats: 712345678 (9 digits), 0712345678 (10 digits starting with 0)
                const phoneRegex = /^(?:0)?(7(?:[0-29]\d|4[0-35-68]|5[7-9]|6[8-9]|9[0-9])\d{6}|1(?:[0-1][0-5])\d{6})$/;
                // A simpler regex for 9 digits (since we encourage 7...) or 10 digits (07...)
                // We show +254, so user might enter 7...
                // Let's accept 9 digits starting with 7 or 1, or 10 digits starting with 0.
                const clean = identifier.replace(/\D/g, '')
                if (clean.length < 9 || clean.length > 10) {
                    newErrors.identifier = "Phone number must be 9 or 10 digits"
                }
            }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        try {
            let finalIdentifier = identifier
            if (method === "phone") {
                // Context: User sees +254 prefix.
                // If they enter 0712..., we strip 0 -> +254712...
                // If they enter 712..., -> +254712...
                let clean = identifier.replace(/\D/g, '')
                if (clean.startsWith('0')) clean = clean.substring(1)
                finalIdentifier = `+254${clean}`
            }

            const resultIdentifier = await login(finalIdentifier, method)
            toast.success("Verification code sent!")
            router.push(`/auth/verify?identifier=${resultIdentifier}&method=${method}&remember_me=${rememberMe}`)
        } catch (err: any) {
            toast.error(err.message || "Something went wrong. Please try again.")
        }
    }

    return (
        <div className="container min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden animate-fade-in-up">
                <div className="bg-[#F58220]/5 p-8 flex flex-col items-center border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-[#F58220] font-bold bg-white px-4 py-2 rounded-full border border-[#F58220]/20 shadow-sm mb-4">
                        <ShieldCheck className="h-4 w-4" /> Trusted Community
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-500 text-center mt-2">
                        Login to access your faith-based community
                    </CardDescription>
                </div>

                <CardContent className="pt-8 space-y-6">
                    <div className="flex bg-gray-100 p-1.5 rounded-xl">
                        <button
                            onClick={() => setMethod("phone")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "phone" ? "bg-white text-[#F58220] shadow-sm scale-100" : "text-gray-500 hover:text-gray-700 scale-95"}`}
                        >
                            <Phone className="h-4 w-4" /> Phone
                        </button>
                        <button
                            onClick={() => setMethod("email")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "email" ? "bg-white text-[#F58220] shadow-sm scale-100" : "text-gray-500 hover:text-gray-700 scale-95"}`}
                        >
                            <Mail className="h-4 w-4" /> Email
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1A1A1A] ml-1">
                                {method === "phone" ? "Phone Number" : "Email Address"}
                            </label>
                            {method === "phone" ? (
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3 mr-3">
                                        <span className="text-xl">🇰🇪</span>
                                        <span className="text-sm font-bold text-gray-600">+254</span>
                                    </div>
                                    <Input
                                        placeholder="712 345 678"
                                        type="tel"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="h-14 pl-[110px] border-gray-100 focus:border-[#F58220] focus:ring-[#F58220] transition-all rounded-xl text-lg"
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <Input
                                    placeholder="name@example.com"
                                    type="email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="h-14 border-gray-100 focus:border-[#F58220] focus:ring-[#F58220] transition-all rounded-xl text-lg"
                                    disabled={loading}
                                    autoFocus
                                />
                            )}
                            {errors.identifier && <p className="text-sm text-red-500 font-medium ml-1">{errors.identifier}</p>}
                        </div>

                        <div className="flex items-center space-x-2 px-1">
                            <Checkbox
                                id="remember_me"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <Label
                                htmlFor="remember_me"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600 cursor-pointer"
                            >
                                Remember me for 30 days
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold bg-[#F58220] hover:bg-[#D66D18] text-white rounded-xl shadow-lg shadow-[#F58220]/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : "Get Verification Code"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="bg-gray-50 border-t border-gray-100 p-8 flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-gray-500 font-medium">
                            Not part of the community?{" "}
                            <Link href="/auth/signup" className="text-[#F58220] font-bold hover:underline">
                                Join Now
                            </Link>
                        </p>
                        <Link href="/auth/support" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2">
                            Trouble logging in?
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Loading session...</p>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
