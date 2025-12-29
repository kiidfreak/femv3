"use client"

import { useAuth } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/auth/login?redirect=${pathname}`)
            return
        }

        // Allow community members to access dashboard for "My Reviews" and Settings
        // if (user && user.user_type !== 'business_owner' && user.user_type !== 'system_admin') {
        //    toast.error("Access denied. Business profile required.")
        //    router.push('/')
        //    return
        // }
    }, [user, loading, router, pathname])

    if (loading) {
        return (
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Verifying access...</p>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="container py-8">
            {children}
        </div>
    )
}
