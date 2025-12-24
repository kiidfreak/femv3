"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, TrendingUp, ThumbsUp, Eye, Users, Package, Store } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="container py-8 space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">Business Insights</h1>
                    <p className="text-gray-500 mt-2">Manage your business performance and community trust.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200">
                    <ShieldCheck className="h-4 w-4" />
                    Church Verified
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <Link href="/dashboard/offerings">
                    <Card className="border-2 border-[#F58220]/20 hover:border-[#F58220] hover:shadow-xl transition-all cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#F58220] transition-colors">Manage Products & Services</h3>
                                    <p className="text-sm text-gray-500 mt-1">Add, edit, or remove your offerings</p>
                                </div>
                                <div className="h-14 w-14 bg-[#F58220]/10 group-hover:bg-[#F58220]/20 rounded-xl flex items-center justify-center transition-colors">
                                    <Package className="h-7 w-7 text-[#F58220]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/directory?view=my-business">
                    <Card className="border-2 border-blue-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-blue-600 transition-colors">View My Business Profile</h3>
                                    <p className="text-sm text-gray-500 mt-1">See how customers see your business</p>
                                </div>
                                <div className="h-14 w-14 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                                    <Store className="h-7 w-7 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Views</p>
                                <p className="text-3xl font-bold text-[#1A1A1A] mt-1">2,845</p>
                                <p className="text-sm text-green-600 font-medium mt-1">+12% from last week</p>
                            </div>
                            <div className="h-12 w-12 bg-[#F58220]/10 rounded-xl flex items-center justify-center">
                                <Eye className="h-6 w-6 text-[#F58220]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Likes</p>
                                <p className="text-3xl font-bold text-[#1A1A1A] mt-1">142</p>
                                <p className="text-sm text-green-600 font-medium mt-1">+5% growth</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <ThumbsUp className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Church Groups</p>
                                <p className="text-3xl font-bold text-[#1A1A1A] mt-1">12</p>
                                <p className="text-sm text-gray-500 font-medium mt-1">Community Reach</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Trust Score</p>
                                <p className="text-3xl font-bold text-[#1A1A1A] mt-1">88/100</p>
                                <p className="text-sm text-gray-500 font-medium mt-1">Stable</p>
                            </div>
                            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Daily Views Chart */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Daily Page Views</CardTitle>
                        <p className="text-sm text-gray-500">Over the last 7 days</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {[220, 180, 310, 280, 380, 240, 290].map((height, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#F58220] to-[#F58220]/60 rounded-t-lg transition-all hover:from-[#D66D18] hover:to-[#D66D18]/60"
                                        style={{ height: `${(height / 400) * 100}%` }}
                                    ></div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Community Engagement */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Community Engagement</CardTitle>
                        <p className="text-sm text-gray-500">Likes and bookings per week</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { week: 'Week 1', likes: 32, bookings: 8 },
                                { week: 'Week 2', likes: 45, bookings: 12 },
                                { week: 'Week 3', likes: 38, bookings: 9 },
                                { week: 'Week 4', likes: 52, bookings: 15 },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">{item.week}</span>
                                        <span className="text-gray-500">{item.likes + item.bookings} total</span>
                                    </div>
                                    <div className="flex gap-1 h-2">
                                        <div
                                            className="bg-[#F58220] rounded-full"
                                            style={{ width: `${(item.likes / 60) * 100}%` }}
                                        ></div>
                                        <div
                                            className="bg-blue-500 rounded-full"
                                            style={{ width: `${(item.bookings / 60) * 100}%` }}
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Church Verification', score: 40, max: 40, status: 'Verified', color: 'green' },
                            { label: 'Profile Completeness', score: 18, max: 20, status: 'High', color: 'blue' },
                            { label: 'Community Reviews', score: 22, max: 25, status: 'Good', color: 'yellow' },
                            { label: 'Account Age', score: 8, max: 15, status: 'Member since 2022', color: 'purple' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-3">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">{item.label}</p>
                                    <p className="text-2xl font-bold text-[#1A1A1A] mt-1">
                                        {item.score}/{item.max}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">{item.status}</p>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-${item.color}-500 transition-all`}
                                        style={{ width: `${(item.score / item.max) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Referral Sources */}
            <Card className="border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Referral Sources</CardTitle>
                    <p className="text-sm text-gray-500">Where your customers are coming from</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { source: 'Direct Search', percentage: 45, color: '#F58220' },
                            { source: 'Church Network', percentage: 35, color: '#3B82F6' },
                            { source: 'Social Media', percentage: 15, color: '#10B981' },
                            { source: 'Word of Mouth', percentage: 5, color: '#8B5CF6' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">{item.source}</span>
                                    <span className="text-sm font-bold text-[#1A1A1A]">{item.percentage}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
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

            {/* Action Button */}
            <div className="flex justify-center pt-4">
                <Button className="h-12 px-8 text-base font-bold bg-[#F58220] hover:bg-[#D66D18] text-white rounded-xl shadow-lg shadow-[#F58220]/20 transition-all hover:scale-[1.02] btn-press">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    View Full Performance Report
                </Button>
            </div>
        </div>
    )
}
