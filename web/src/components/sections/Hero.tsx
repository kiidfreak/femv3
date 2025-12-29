import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Users, Globe, MapPin, Search as SearchIcon, Store, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function Hero({ stats = { total_members: 0 }, recentMembers = [] }: { stats?: { total_members: number }, recentMembers?: any[] }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchType, setSearchType] = useState<"businesses" | "offerings">("businesses")
    const router = useRouter()

    const [suggestions, setSuggestions] = useState<{ businesses: any[], categories: any[] }>({ businesses: [], categories: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [nearMe, setNearMe] = useState(false)
    const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null)

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim() && !nearMe) return

        let url = `/directory?search=${encodeURIComponent(searchQuery)}&view=${searchType}`
        if (nearMe && userCoords) {
            url += `&lat=${userCoords.lat}&lng=${userCoords.lng}&radius=20`
        }
        router.push(url)
    }

    const fetchSuggestions = async (q: string) => {
        if (q.length < 2) {
            setSuggestions({ businesses: [], categories: [] })
            return
        }
        setIsSearching(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v3'}/businesses/suggestions/?q=${encodeURIComponent(q)}`)
            if (res.ok) {
                const data = await res.json()
                setSuggestions(data)
                setShowSuggestions(true)
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleLocationToggle = () => {
        if (!nearMe) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setUserCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setNearMe(true)
                }, (error) => {
                    console.error("Error getting location:", error)
                    alert("Please enable location access to use this feature.")
                })
            }
        } else {
            setNearMe(false)
            setUserCoords(null)
        }
    }

    return (
        <section className="relative overflow-hidden min-h-[750px] flex items-center bg-[#FAF9F6]">
            {/* Background Image utilizing Wheat Field concept with overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 via-white/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-multiply transition-transform duration-[10s] hover:scale-105" />
            </div>

            <div className="container relative z-10 pt-28 pb-12">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-left animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-[#F58220] text-sm font-bold mb-8">
                            <Users className="h-4 w-4" />
                            Community Commerce Network
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-[#1A1A1A] leading-[1.1] mb-2">
                            Welcome to
                        </h1>
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-[#F58220] leading-[1.1] mb-6">
                            Faith Connect
                        </h1>
                        <h2 className="text-3xl font-bold text-gray-700 mb-8 border-l-4 border-[#F58220] pl-6">
                            Business Directory
                        </h2>

                        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
                            Discover trusted businesses owned by fellow believers.
                            Support local commerce while building meaningful relationships grounded in shared faith and values.
                        </p>

                        {/* PREMIUM SEARCH SLOT */}
                        <div className="relative max-w-2xl bg-white p-2 rounded-3xl shadow-2xl shadow-orange-100/50 border border-gray-100 group transition-all hover:shadow-orange-200/50 mb-12">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        className="h-14 pl-12 pr-4 bg-transparent border-none text-lg placeholder:text-gray-400 focus-visible:ring-0 rounded-2xl"
                                        placeholder={searchType === "businesses" ? "Search for businesses..." : "Search for offerings..."}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            fetchSuggestions(e.target.value)
                                        }}
                                        onFocus={() => {
                                            if (searchQuery.length >= 2) setShowSuggestions(true)
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => setShowSuggestions(false), 200)
                                        }}
                                    />

                                    {/* Search Suggestions Dropdown */}
                                    {showSuggestions && (suggestions.businesses.length > 0 || suggestions.categories.length > 0) && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {suggestions.businesses.length > 0 && (
                                                <div className="p-4 border-b border-gray-50">
                                                    <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Businesses</h3>
                                                    <div className="space-y-1">
                                                        {suggestions.businesses.map((biz) => (
                                                            <Link key={biz.id} href={`/business/${biz.id}`} className="flex items-center gap-3 p-2 hover:bg-orange-50 rounded-xl transition-colors group/item">
                                                                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#F58220] font-bold text-xs">
                                                                    {biz.business_name.charAt(0)}
                                                                </div>
                                                                <span className="text-sm font-bold text-[#1A1A1A] group-hover/item:text-[#F58220]">{biz.business_name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {suggestions.categories.length > 0 && (
                                                <div className="p-4">
                                                    <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Categories</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {suggestions.categories.map((cat) => (
                                                            <Link key={cat.id} href={`/directory?category=${cat.id}`} className="px-3 py-1.5 bg-gray-50 hover:bg-orange-100 text-gray-600 hover:text-[#F58220] rounded-full text-xs font-bold transition-all">
                                                                {cat.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 px-2 border-l border-gray-100 sm:min-w-[200px]">
                                    <button
                                        type="button"
                                        onClick={handleLocationToggle}
                                        className={`flex-1 h-10 rounded-xl px-3 flex items-center justify-center gap-2 text-xs font-bold transition-all ${nearMe ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        <MapPin className={`h-3.5 w-3.5 ${nearMe ? "animate-pulse" : ""}`} />
                                        {nearMe ? "Near Me ON" : "Near Me"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSearchType(searchType === "businesses" ? "offerings" : "businesses")}
                                        className="h-10 px-3 bg-gray-50 text-gray-400 rounded-xl hover:text-[#F58220] transition-colors"
                                        title="Toggle search type"
                                    >
                                        {searchType === "businesses" ? <Store className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                                    </button>
                                </div>
                                <Button type="submit" className="h-14 px-8 rounded-2xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-lg transition-transform hover:scale-[1.02] active:scale-95">
                                    Search
                                </Button>
                            </form>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex -space-x-3">
                                {recentMembers.length > 0 ? (
                                    recentMembers.map((member, idx) => (
                                        <div key={idx} className="h-12 w-12 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg transform hover:scale-110 transition-transform duration-300">
                                            {member.profile_image_url ? (
                                                <img src={member.profile_image_url} alt={member.first_name || 'User'} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#F58220] text-white font-bold text-lg">
                                                    {member.first_name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    [1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-gray-200 animate-pulse" />
                                    ))
                                )}
                            </div>
                            <p className="text-sm font-bold text-gray-500">
                                Joined by <span className="text-[#F58220]">{stats.total_members.toLocaleString()}+</span> community members
                            </p>
                        </div>
                    </div>

                    {/* Right Side Visual */}
                    <div className="relative hidden lg:flex items-center justify-center animate-fade-in-bottom">
                        <div className="relative w-full aspect-square max-w-[500px]">
                            {/* Decorative Orbs */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl" />

                            <div className="relative h-full w-full rounded-[40px] overflow-hidden shadow-2xl rotate-2 transition-transform hover:rotate-0 duration-700 bg-white p-4">
                                <div className="h-full w-full rounded-[32px] overflow-hidden relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2834&auto=format&fit=crop"
                                        alt="Community"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-sm font-bold tracking-wider uppercase">Live in Community</span>
                                        </div>
                                        <p className="text-2xl font-bold leading-tight">Supporting believers, building a better future together.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -left-12 bottom-20 bg-white p-5 rounded-3xl shadow-2xl shadow-orange-100 border border-gray-100 flex items-center gap-4 animate-bounce-slow">
                                <div className="bg-orange-100 p-4 rounded-2xl">
                                    <ShieldCheck className="h-8 w-8 text-[#F58220]" />
                                </div>
                                <div className="pr-4">
                                    <div className="text-xl font-black text-[#1A1A1A]">Church Verified</div>
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Community Trusted</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
