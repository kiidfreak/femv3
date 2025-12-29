"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2, Phone, Mail } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { useEffect } from "react"

export default function SignupPage() {
    const router = useRouter()
    const { signup, loading, user } = useAuth()

    // Redirect if already authenticated
    useEffect(() => {
        if (user) {
            router.push('/dashboard')
        }
    }, [user, router])
    const [formData, setFormData] = useState({
        first_name: "",
        email: "",
        phone: "",
        partnership_number: "",
    })
    const [method, setMethod] = useState<"phone" | "email">("phone")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.first_name || !formData.email || !formData.phone || !formData.partnership_number) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            const identifier = await signup({ ...formData, method })
            toast.success("Account created! Sending verification code...")
            router.push(`/auth/verify?identifier=${identifier}&method=${method}&from=signup`)
        } catch (err: any) {
            toast.error(err.message || "Signup failed. Please try again.")
        }
    }

    return (
        <div className="container min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-lg border-none shadow-2xl bg-white overflow-hidden animate-fade-in-up">
                <div className="bg-[#F58220]/5 p-8 flex flex-col items-center border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-[#F58220] font-bold bg-white px-4 py-2 rounded-full border border-[#F58220]/20 shadow-sm mb-4">
                        <ShieldCheck className="h-4 w-4" /> Join Trusted Network
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Create Account</CardTitle>
                    <CardDescription className="text-gray-500 text-center mt-2">
                        Join thousands of believers supporting faith-based businesses
                    </CardDescription>
                </div>

                <CardContent className="pt-8 space-y-6">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Receive Code via</label>
                        <div className="flex bg-gray-100 p-1.5 rounded-xl">
                            <button
                                onClick={() => setMethod("phone")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "phone" ? "bg-white text-[#F58220] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <Phone className="h-4 w-4" /> SMS / WhatsApp
                            </button>
                            <button
                                onClick={() => setMethod("email")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${method === "email" ? "bg-white text-[#F58220] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <Mail className="h-4 w-4" /> Email
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-[#1A1A1A] ml-1">Full Name</label>
                            <Input
                                placeholder="John Doe"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="h-12 border-gray-100 focus:border-[#F58220] focus:ring-[#F58220] rounded-xl"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1A1A1A] ml-1">Email Address</label>
                            <Input
                                placeholder="john@example.com"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-12 border-gray-100 focus:border-[#F58220] focus:ring-[#F58220] rounded-xl"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1A1A1A] ml-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3 mr-3">
                                    <span className="text-xl">🇰🇪</span>
                                    <span className="text-sm font-bold text-gray-600">+254</span>
                                </div>
                                <Input
                                    placeholder="712 345 678"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-12 pl-[110px] border-gray-100 focus:border-[#F58220] focus:ring-[#F58220] rounded-xl"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-[#1A1A1A] ml-1">Partnership Number</label>
                            <Input
                                placeholder="FEM-XXXXX"
                                value={formData.partnership_number}
                                onChange={(e) => setFormData({ ...formData, partnership_number: e.target.value })}
                                className="h-12 border-gray-100 focus:border-[#F58220] focus:ring-[#F58220] rounded-xl"
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold bg-[#F58220] hover:bg-[#D66D18] text-white rounded-xl shadow-lg shadow-[#F58220]/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 md:col-span-2 btn-press"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Creating Account</span>
                                    <div className="flex gap-1 ml-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                    </div>
                                </div>
                            ) : "Create Account & Get Code"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="bg-gray-50 border-t border-gray-100 p-8 flex justify-center">
                    <p className="text-sm text-gray-500 font-medium">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-[#F58220] font-bold hover:underline">
                            Log In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
