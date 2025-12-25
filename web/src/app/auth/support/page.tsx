"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Mail, ArrowLeft, Phone } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
    return (
        <div className="container min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white animate-fade-in-up">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-[#F58220]/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-[#F58220]" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Account Support</CardTitle>
                    <CardDescription className="text-gray-500 text-lg mt-2">
                        Need help accessing your account?
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Passwordless Login
                            </h3>
                            <p className="text-sm text-blue-700">
                                Faith Connect uses secure One-Time Passwords (OTP). You don't need to remember a password. simply enter your registered phone number or email on the login page to receive a code.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Lost Access?
                            </h3>
                            <p className="text-sm text-gray-600">
                                If you no longer have access to your registered phone number or email, please contact our support team for manual verification.
                            </p>
                            <Button variant="link" className="text-[#F58220] px-0 h-auto mt-2 font-bold">
                                Contact Support
                            </Button>
                        </div>
                    </div>

                    <Button asChild className="w-full h-14 text-lg font-bold bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-xl shadow-lg">
                        <Link href="/auth/login">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Login
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
