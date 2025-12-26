"use client"

import { useState, useEffect } from "react"
import { BusinessCard } from "@/components/directory/BusinessCard"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Loader2, Package, Store as StoreIcon } from "lucide-react"
import { OfferingCard } from "@/components/directory/OfferingCard"
import { cn } from "@/lib/utils"

function DirectoryContent() {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"businesses" | "offerings">("businesses")
    const [businesses, setBusinesses] = useState<any[]>([])
    const [offerings, setOfferings] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [verifiedOnly, setVerifiedOnly] = useState(false)
    const [highRatingsOnly, setHighRatingsOnly] = useState(false)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [pageSize, setPageSize] = useState(12)

    const fetchContent = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            if (searchQuery) params.append('search', searchQuery)

            if (selectedCategory !== 'All') {
                const cat = categories.find(c => c.name === selectedCategory)
                if (cat) {
                    if (viewMode === "businesses") {
                        params.append('category', cat.id.toString())
                    } else {
                        params.append('business__category', cat.id.toString())
                    }
                }
            }

            if (viewMode === "businesses") {
                if (verifiedOnly) params.append('is_verified', 'true')
                const res = await apiClient.businesses.list(params.toString())
                if (!res.ok) throw new Error('Failed to fetch businesses')
                const data = await res.json()
                const results = data.results || (Array.isArray(data) ? data : [])
                setTotalCount(data.count || results.length)
                setBusinesses(results.map((biz: any) => ({
                    id: biz.id,
                    name: biz.business_name,
                    category: biz.category_name || 'Business',
                    location: biz.address,
                    rating: parseFloat(biz.rating) || 0,
                    reviews: biz.review_count || 0,
                    verified: biz.is_verified || false,
                    productCount: biz.product_count || 0,
                    serviceCount: biz.service_count || 0,
                    image: biz.business_image_url || biz.business_logo_url
                })))
            } else {
                // Fetch both products and services for offerings view
                const [prodRes, servRes] = await Promise.all([
                    apiClient.products.list(params.toString()),
                    apiClient.services.list(params.toString())
                ])

                const products = prodRes.ok ? (await prodRes.json()).results || [] : []
                const services = servRes.ok ? (await servRes.json()).results || [] : []

                const combined = [
                    ...products.map((p: any) => ({ ...p, type: 'product' as const })),
                    ...services.map((s: any) => ({ ...s, type: 'service' as const }))
                ]

                // Simple client-side search if needed, but backend search= is preferred
                setTotalCount(combined.length)
                setOfferings(combined)
            }
        } catch (error) {
            console.error("Failed to fetch content", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await apiClient.categories.list()
            if (res.ok) {
                const data = await res.json()
                const catList = data.results || (Array.isArray(data) ? data : [])
                setCategories(catList)

                const paramId = searchParams.get('category')
                if (paramId) {
                    const numericId = parseInt(paramId)
                    const found = catList.find((c: any) => c.id === numericId)
                    if (found) {
                        setSelectedCategory(found.name)
                    }
                }

                const urlSearch = searchParams.get('search')
                if (urlSearch) setSearchQuery(urlSearch)

                const urlView = searchParams.get('view')
                if (urlView === 'businesses' || urlView === 'offerings') {
                    setViewMode(urlView as "businesses" | "offerings")
                }
            }
        } catch (error) {
            console.error("Failed to fetch categories", error)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchContent()
        }, 300)
        return () => clearTimeout(timer)
    }, [page, searchQuery, selectedCategory, verifiedOnly, viewMode])

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [searchQuery, selectedCategory, verifiedOnly])

    const filteredBusinesses = highRatingsOnly
        ? businesses.filter(biz => biz.rating >= 4.0)
        : businesses

    const displayedCategories = categories.filter(cat => {
        if (viewMode === "businesses") {
            return (cat as any).business_count > 0;
        } else {
            return (cat as any).offering_count > 0;
        }
    });

    return (
        <div className="container py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">Community Directory</h1>
                    <p className="text-gray-500 mt-2">Find trusted businesses and faith-based offerings.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto md:flex-1 md:justify-end">
                    {/* View Switcher */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full sm:w-fit">
                        <button
                            onClick={() => setViewMode("businesses")}
                            className={cn(
                                "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                viewMode === "businesses" ? "bg-white text-[#F58220] shadow-md" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <StoreIcon className="h-4 w-4" /> Businesses
                        </button>
                        <button
                            onClick={() => setViewMode("offerings")}
                            className={cn(
                                "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                viewMode === "offerings" ? "bg-white text-[#F58220] shadow-md" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Package className="h-4 w-4" /> Offerings
                        </button>
                    </div>

                    <div className="relative w-full sm:max-w-[280px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            className="pl-11 h-12 w-full rounded-2xl border-gray-100 shadow-sm focus:ring-2 focus:ring-orange-100"
                            placeholder={viewMode === "businesses" ? "Search businesses..." : "Search products & services..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button
                        variant={showFilters || verifiedOnly || highRatingsOnly ? "secondary" : "outline"}
                        className="h-12 gap-2 rounded-2xl border-gray-100 w-full sm:w-auto px-6 font-bold shadow-sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4" /> Filters
                    </Button>
                </div>
            </div>


            {/* Advanced Filters Panel */}
            {
                showFilters && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row flex-wrap gap-6 animate-fade-in-bottom shadow-sm">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="verified"
                                checked={verifiedOnly}
                                onChange={(e) => setVerifiedOnly(e.target.checked)}
                                className="h-5 w-5 rounded-md border-gray-300 text-[#F58220] focus:ring-[#F58220] cursor-pointer"
                            />
                            <label htmlFor="verified" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                                Church Verified Only
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="rating"
                                checked={highRatingsOnly}
                                onChange={(e) => setHighRatingsOnly(e.target.checked)}
                                className="h-5 w-5 rounded-md border-gray-300 text-[#F58220] focus:ring-[#F58220] cursor-pointer"
                            />
                            <label htmlFor="rating" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                                High Ratings (4.0+)
                            </label>
                        </div>
                        {(verifiedOnly || highRatingsOnly) && (
                            <button
                                onClick={() => { setVerifiedOnly(false); setHighRatingsOnly(false) }}
                                className="text-sm text-[#F58220] hover:underline font-bold sm:ml-auto"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )
            }

            <div className="flex gap-2.5 mb-10 overflow-x-auto pb-4 md:flex-wrap scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <Button
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("All")}
                    className={cn(
                        "rounded-full h-11 px-6 font-bold transition-all whitespace-nowrap",
                        selectedCategory === "All" ? "bg-[#F58220] hover:bg-[#D66D18] shadow-lg shadow-orange-100" : "border-gray-200 text-gray-600"
                    )}
                >
                    All
                </Button>
                {displayedCategories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.name ? "default" : "outline"}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={cn(
                            "rounded-full h-11 px-6 font-bold transition-all whitespace-nowrap",
                            selectedCategory === cat.name ? "bg-[#F58220] hover:bg-[#D66D18] shadow-lg shadow-orange-100" : "border-gray-200 text-gray-600"
                        )}
                    >
                        {cat.name}
                        <span className="ml-1.5 opacity-60 font-medium text-xs">
                            ({viewMode === "businesses" ? (cat as any).business_count : (cat as any).offering_count})
                        </span>
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
                {loading ? (
                    // Premium Skeletons
                    [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-8 w-full rounded-md" />
                            </div>
                        </div>
                    ))
                ) : viewMode === "businesses" ? (
                    filteredBusinesses.length > 0 ? (
                        filteredBusinesses.map((biz) => (
                            <BusinessCard key={biz.id} {...biz} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <StoreIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700">No businesses found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )
                ) : (
                    offerings.length > 0 ? (
                        offerings.map((off) => (
                            <OfferingCard
                                key={`${off.type}-${off.id}`}
                                id={off.id}
                                businessId={off.business}
                                businessName={off.business_name}
                                name={off.name}
                                description={off.description}
                                type={off.type}
                                price={off.price}
                                priceCurrency={off.price_currency}
                                priceRange={off.price_range}
                                duration={off.duration}
                                image={off.type === "product" ? off.product_image_url : off.service_image_url}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700">No offerings found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )
                )}
            </div>

            {/* Pagination UI */}
            {!loading && totalCount > pageSize && (
                <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-xl border-gray-200"
                    >
                        Previous
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, i) => {
                            const pageNum = i + 1;
                            // Show limited numbers if too many
                            if (
                                pageNum === 1 ||
                                pageNum === Math.ceil(totalCount / pageSize) ||
                                (pageNum >= page - 1 && pageNum <= page + 1)
                            ) {
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? "default" : "outline"}
                                        onClick={() => setPage(pageNum)}
                                        className={page === pageNum
                                            ? "bg-[#F58220] hover:bg-[#D66D18] w-10 h-10 rounded-xl"
                                            : "border-gray-200 w-10 h-10 rounded-xl"}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            } else if (
                                pageNum === page - 2 ||
                                pageNum === page + 2
                            ) {
                                return <span key={pageNum} className="px-1 shadow-none">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(totalCount / pageSize)}
                        className="rounded-xl border-gray-200"
                    >
                        Next
                    </Button>
                </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                Showing {businesses.length} of {totalCount} businesses
            </div>
        </div>
    )
}

export default function DirectoryPage() {
    return (
        <Suspense fallback={
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Loading directory...</p>
            </div>
        }>
            <DirectoryContent />
        </Suspense>
    )
}
