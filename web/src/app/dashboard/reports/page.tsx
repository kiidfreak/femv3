"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import {
    Download,
    TrendingUp,
    Users,
    Eye,
    Star,
    ShieldCheck,
    ArrowUpRight,
    Activity,
    MapPin,
    Search,
    Globe,
    CheckCircle2,
    Clock,
    Flame
} from "lucide-react"
import { toast } from "sonner"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    PieChart,
    Pie
} from "recharts"

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await apiClient.businesses.stats()
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error)
            toast.error("Could not load performance reports")
        } finally {
            setIsLoading(false)
        }
    }

    const downloadCSV = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v3'}/businesses/download_report/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
                }
            })
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `performance_report_${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            toast.error("Failed to download report")
        }
    }

    if (isLoading) return <div className="p-8 text-center">Loading reports...</div>
    if (!stats) return <div className="p-8 text-center text-red-500">Error loading data.</div>

    const trafficData = [
        { name: 'Direct', value: stats.traffic_sources?.direct || 0, color: '#F58220' },
        { name: 'Search', value: stats.traffic_sources?.search || 0, color: '#1A1A1A' },
        { name: 'Social', value: stats.traffic_sources?.social || 0, color: '#3B82F6' },
        { name: 'Referral', value: stats.traffic_sources?.referral || 0, color: '#10B981' },
    ]

    const heatMapData = stats.offerings_heatmap || [
        { name: 'Holy Bible', views: 45, conversions: 12 },
        { name: 'Study Lamp', views: 32, conversions: 8 },
        { name: 'Journal', views: 28, conversions: 5 },
        { name: 'Bookmarks', views: 15, conversions: 2 },
    ]

    return (
        <div className="container py-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Full Performance Report</h1>
                    <p className="text-gray-500 mt-2">In-depth insights into your business presence and growth.</p>
                </div>
                <Button onClick={downloadCSV} className="bg-[#1A1A1A] hover:bg-black text-white px-6 h-12 rounded-xl font-bold flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export CSV
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-xl bg-orange-50/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-2xl">
                                <Eye className="h-6 w-6 text-[#F58220]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Visibility</p>
                                <h3 className="text-3xl font-black text-[#1A1A1A] mt-1">{stats.total_views}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-blue-50/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-2xl">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Growth</p>
                                <h3 className="text-3xl font-black text-[#1A1A1A] mt-1">+{stats.favorites}</h3>
                                <p className="text-xs text-blue-600 font-bold">New Favorites</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-green-50/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-2xl">
                                <ShieldCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Trust Score</p>
                                <h3 className="text-3xl font-black text-[#1A1A1A] mt-1">{stats.trust_score}%</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-purple-50/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-2xl">
                                <Flame className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Engagement</p>
                                <h3 className="text-3xl font-black text-[#1A1A1A] mt-1">{stats.engagement_rate || '4.2%'}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Traffic Sources */}
                <Card className="lg:col-span-1 border-none shadow-2xl overflow-hidden">
                    <CardHeader className="bg-[#1A1A1A] text-white">
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-orange-400" />
                            Traffic Sources
                        </CardTitle>
                        <CardDescription className="text-gray-400">Where your visitors come from</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={trafficData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {trafficData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 mt-4">
                            {trafficData.map((t) => (
                                <div key={t.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                                        <span className="text-sm font-bold text-gray-600">{t.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-[#1A1A1A]">{t.value} views</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Offerings Heatmap */}
                <Card className="lg:col-span-2 border-none shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-[#F58220]" />
                            Offering Performance
                        </CardTitle>
                        <CardDescription>Most viewed products & services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={heatMapData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        cursor={{ fill: '#F97316', opacity: 0.1 }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="views" fill="#F58220" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Trust Projection Checklist */}
                <Card className="border-none shadow-2xl bg-[#1A1A1A] text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black flex items-center gap-3">
                            < ShieldCheck className="h-8 w-8 text-[#F58220]" />
                            Trust Projection Roadmap
                        </CardTitle>
                        <CardDescription className="text-gray-400">Actions to reach Platinum Trust status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        {stats.trust_breakdown?.map((item: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${item.score === item.max ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {item.score === item.max ? <CheckCircle2 className="h-4 w-4" /> : < Clock className="h-4 w-4" />}
                                        </div>
                                        <span className="font-bold">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-400">{item.score}/{item.max} Pts</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${item.score === item.max ? 'bg-green-500' : 'bg-[#F58220]'}`}
                                        style={{ width: `${(item.score / item.max) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.status}</p>
                            </div>
                        ))}

                        <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                            <h4 className="text-lg font-bold mb-2">Pro Tip: Platinum Status</h4>
                            <p className="text-sm text-gray-400">Businesses with a Trust Score above 90% receive a Platinum badge and are prioritized in community-wide searches.</p>
                            <Button className="mt-4 w-full bg-white text-black hover:bg-gray-200 font-black rounded-xl">
                                Verify Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Trends */}
                <Card className="border-none shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Visibility Trends
                        </CardTitle>
                        <CardDescription>Daily page views over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.view_trends || [
                                    { date: 'Mon', views: 40 },
                                    { date: 'Tue', views: 35 },
                                    { date: 'Wed', views: 55 },
                                    { date: 'Thu', views: 75 },
                                    { date: 'Fri', views: 60 },
                                    { date: 'Sat', views: 90 },
                                    { date: 'Sun', views: 110 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F58220" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F58220" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="views" stroke="#F58220" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
