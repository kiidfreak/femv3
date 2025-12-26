"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, TrendingUp, ThumbsUp, Eye, Users, Package, Store, Sparkles, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface DashboardStats {
    total_views: number;
    likes: number;
    church_groups: number;
    trust_score: number;
    trust_breakdown: any[];
    daily_views: number[];
    referral_sources: any[];
    products_count: number;
    services_count: number;
}

function DashboardContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [highlightCatalog, setHighlightCatalog] = useState(false)

    useEffect(() => {
        if (user) {
            fetchStats()
            fetchBusiness()
        }
    }, [user])

    useEffect(() => {
        if (searchParams.get('highlight') === 'catalog') {
            setHighlightCatalog(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [searchParams])

    const fetchStats = async () => {
        try {
            const res = await apiClient.businesses.getStats()
            if (res.ok) {
                const data = await res.json()
                setStats(data)

                // Auto-highlight catalog if no products/services
                if (data.products_count === 0 && data.services_count === 0) {
                    setHighlightCatalog(true)
                }
            } else {
                // Return default empty stats on error or 404
                setStats({
                    total_views: 0,
                    likes: 0,
                    church_groups: 0,
                    trust_score: 0,
                    products_count: 0,
                    services_count: 0,
                    trust_breakdown: [
                        { label: 'Church Verification', score: 0, max: 40, status: 'Pending', color: 'bg-gray-300' },
                        { label: 'Profile Completeness', score: 0, max: 20, status: 'Low', color: 'bg-gray-300' },
                        { label: 'Community Reviews', score: 0, max: 25, status: 'None', color: 'bg-gray-300' },
                        { label: 'Account Age', score: 0, max: 15, status: 'New', color: 'bg-gray-300' },
                    ],
                    daily_views: [0, 0, 0, 0, 0, 0, 0],
                    referral_sources: [
                        { source: 'Direct', percentage: 0, color: '#F58220' }
                    ]
                })

                // Auto-highlight catalog if business exists but has no offerings
                if (res.ok) {
                    const data = await res.json()
                    if (data.products_count === 0 && data.services_count === 0) {
                        setHighlightCatalog(true)
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchBusiness = async () => {
        try {
            const res = await apiClient.businesses.myBusiness()
            if (res.ok) {
                const business = await res.json()
                setBusinessId(business.id)
            }
        } catch (error) {
            console.error("Failed to fetch business:", error)
        }
    }

    if (authLoading || (isLoading && !stats)) {
        return (
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Loading your business insights...</p>
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="container py-8 space-y-8 animate-fade-in-up">
            {/* Tailwind Safelist for Dynamic Stats Colors */}
            <div className="hidden bg-green-500 bg-blue-500 bg-yellow-500 bg-purple-500" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">Business Insights</h1>
                    <p className="text-gray-500 mt-2">Manage your business performance and community trust.</p>
                </div>
                {user?.has_business_profile && (
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border shrink-0 w-fit",
                        user?.is_verified
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                        {user?.is_verified ? (
                            <>
                                <ShieldCheck className="h-4 w-4" />
                                Church Verified
                            </>
                        ) : (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin-slow" />
                                Verification Pending
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Setup Invitation Banner - Show if no business profile */}
            {user?.user_type === 'business_owner' && !user.has_business_profile && (
                <Card className="border-none bg-gradient-to-r from-[#F58220] to-[#D66D18] text-white shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Store className="h-32 w-32" />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold mb-2">Ready to grow your business?</h2>
                                <p className="text-white/80 max-w-xl">
                                    You haven't set up your business profile yet. Complete your setup now to join the Faith Connect directory,
                                    showcase your offerings, and earn community trust.
                                </p>
                            </div>
                            <Link href="/onboarding/business">
                                <Button size="lg" className="bg-white text-[#F58220] hover:bg-gray-100 font-bold px-8 h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                                    Set Up Your Business Profile <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/dashboard/offerings" className="relative group/link">
                    <Card className={cn(
                        "border-2 transition-all cursor-pointer group h-full",
                        highlightCatalog
                            ? "border-[#F58220] shadow-[#F58220]/20 shadow-xl animate-pulse-soft ring-2 ring-[#F58220]/20"
                            : "border-[#F58220]/20 hover:border-[#F58220] hover:shadow-xl"
                    )}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#F58220] transition-colors line-clamp-1">Manage Offerings</h3>
                                        {highlightCatalog && (
                                            <span className="flex items-center gap-1 bg-[#F58220] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                                                <Sparkles className="h-3 w-3" />
                                                START
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Add products & services</p>
                                </div>
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                    highlightCatalog ? "bg-[#F58220] text-white" : "bg-[#F58220]/10 text-[#F58220] group-hover:bg-[#F58220]/20"
                                )}>
                                    <Package className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {highlightCatalog && (
                        <div className="absolute -top-12 left-0 right-0 flex justify-center animate-fade-in-bottom z-10 pointer-events-none">
                            <div className="bg-[#1A1A1A] text-white text-xs py-2 px-4 rounded-lg shadow-xl relative text-center max-w-[250px]">
                                Add your first product/service!
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A1A] rotate-45"></div>
                            </div>
                        </div>
                    )}
                </Link>

                <Link href="/dashboard/reviews" className="block">
                    <Card className="border-2 border-yellow-100 hover:border-yellow-500 hover:shadow-xl transition-all cursor-pointer group h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-yellow-600 transition-colors">Reviews</h3>
                                    <p className="text-sm text-gray-500 mt-1">See customer feedback</p>
                                </div>
                                <div className="h-10 w-10 bg-yellow-50 group-hover:bg-yellow-100 rounded-xl flex items-center justify-center transition-colors shrink-0">
                                    <ThumbsUp className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/settings" className="block">
                    <Card className="border-2 border-gray-100 hover:border-gray-500 hover:shadow-xl transition-all cursor-pointer group h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-gray-600 transition-colors">Settings</h3>
                                    <p className="text-sm text-gray-500 mt-1">Update profile & alerts</p>
                                </div>
                                <div className="h-10 w-10 bg-gray-50 group-hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors shrink-0">
                                    <Users className="h-5 w-5 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={businessId ? `/business/${businessId}` : '#'} className={cn("block", !businessId && "pointer-events-none opacity-50")}>
                    <Card className="border-2 border-blue-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-blue-600 transition-colors">Public Profile</h3>
                                    <p className="text-sm text-gray-500 mt-1">View as visitor</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors shrink-0">
                                    <Store className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Views', value: stats.total_views.toLocaleString(), icon: Eye, color: 'text-[#F58220]', bg: 'bg-[#F58220]/10' },
                    { label: 'Likes', value: stats.likes.toLocaleString(), icon: ThumbsUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Church Groups', value: stats.church_groups, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Trust Score', value: `${stats.trust_score}/100`, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{stat.value}</p>
                                </div>
                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Daily Page Views</CardTitle>
                        <p className="text-sm text-gray-500">Over the last 7 days</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {stats.daily_views.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full flex flex-col items-center">
                                        <div className="absolute -top-8 px-2 py-1 bg-[#1A1A1A] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {val}
                                        </div>
                                        <div
                                            className="w-full bg-gradient-to-t from-[#F58220] to-[#F58220]/60 rounded-t-lg transition-all hover:scale-x-105"
                                            style={{ height: `${Math.max(10, (val / (Math.max(...stats.daily_views) || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Referral Sources</CardTitle>
                        <p className="text-sm text-gray-500">Where your customers are coming from</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {stats.referral_sources.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">{item.source}</span>
                                        <span className="text-sm font-bold text-[#1A1A1A]">{item.percentage}%</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${item.percentage}%`,
                                                backgroundColor: item.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Trust Score Breakdown */}
            <Card className="border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Trust Score Breakdown</CardTitle>
                    <p className="text-sm text-gray-500">How your community standing is calculated</p>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.trust_breakdown.map((item, i) => (
                            <div key={i} className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{item.label}</p>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <p className="text-3xl font-bold text-[#1A1A1A]">
                                            {item.score}
                                        </p>
                                        <p className="text-gray-400 font-medium">/{item.max}</p>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{item.status}</p>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-1000 ease-out", item.color)}
                                        style={{ width: `${(item.score / item.max) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Action Button */}
            <div className="flex flex-col items-center gap-4 pt-4">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <Button className="h-14 px-10 text-lg font-bold bg-[#F58220] hover:bg-[#D66D18] text-white rounded-2xl shadow-xl shadow-[#F58220]/30 transition-all hover:scale-[1.05] hover:rotate-1 active:scale-95 group">
                    <TrendingUp className="mr-3 h-6 w-6 group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" />
                    View Full Performance Report
                </Button>
                <p className="text-gray-400 text-sm italic">Weekly reports are generated every Sunday at midnight.</p>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Initializing dashboard...</p>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}
