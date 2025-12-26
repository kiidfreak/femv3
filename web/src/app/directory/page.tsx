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
import { Loader2 } from "lucide-react"

function DirectoryContent() {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [businesses, setBusinesses] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [verifiedOnly, setVerifiedOnly] = useState(false)
    const [highRatingsOnly, setHighRatingsOnly] = useState(false)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [pageSize, setPageSize] = useState(12)

    const fetchBusinesses = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            if (searchQuery) params.append('search', searchQuery)
            if (selectedCategory !== 'All') {
                const cat = categories.find(c => c.name === selectedCategory)
                if (cat) params.append('category', cat.id.toString())
            }
            if (verifiedOnly) params.append('is_verified', 'true')
            // Note: highRatingsOnly is still client-side unless backend supports min_rating

            const res = await apiClient.businesses.list(params.toString())
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()

            // Handle paginated response structure
            const results = data.results || (Array.isArray(data) ? data : [])
            setTotalCount(data.count || results.length)

            const mappedData = results.map((biz: any) => ({
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
            }))

            setBusinesses(mappedData)
        } catch (error) {
            console.error("Failed to fetch businesses", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await apiClient.categories.list()
            if (res.ok) {
                const data = await res.json()
                setCategories(data)

                const paramId = searchParams.get('category')
                if (paramId) {
                    const numericId = parseInt(paramId)
                    const found = data.find((c: any) => c.id === numericId)
                    if (found) {
                        setSelectedCategory(found.name)
                    }
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
            fetchBusinesses()
        }, 300)
        return () => clearTimeout(timer)
    }, [page, searchQuery, selectedCategory, verifiedOnly])

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [searchQuery, selectedCategory, verifiedOnly])

    const filteredBusinesses = highRatingsOnly
        ? businesses.filter(biz => biz.rating >= 4.0)
        : businesses

    return (
        <div className="container py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-[#1A1A1A]">Business Directory</h1>
                    <p className="text-gray-500 mt-2">Find and support trusted businesses in our community.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:justify-end">
                    <div className="relative flex-1 md:max-w-xl w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            className="pl-10 w-full"
                            placeholder="Search businesses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Button
                    variant={showFilters || verifiedOnly || highRatingsOnly ? "secondary" : "outline"}
                    className="gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="h-4 w-4" /> Filters
                </Button>
            </div>


            {/* Advanced Filters Panel */}
            {
                showFilters && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-6 animate-fade-in-bottom">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="verified"
                                checked={verifiedOnly}
                                onChange={(e) => setVerifiedOnly(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#F58220] focus:ring-[#F58220]"
                            />
                            <label htmlFor="verified" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                Church Verified Only
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="rating"
                                checked={highRatingsOnly}
                                onChange={(e) => setHighRatingsOnly(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#F58220] focus:ring-[#F58220]"
                            />
                            <label htmlFor="rating" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                High Ratings (4.0+)
                            </label>
                        </div>
                        {(verifiedOnly || highRatingsOnly) && (
                            <button
                                onClick={() => { setVerifiedOnly(false); setHighRatingsOnly(false) }}
                                className="text-sm text-[#F58220] hover:underline font-bold ml-auto"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                )
            }

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible scrollbar-hide">
                <Button
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("All")}
                    className={selectedCategory === "All" ? "bg-[#F58220] hover:bg-[#D66D18]" : "border-gray-200"}
                >
                    All
                </Button>
                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.name ? "default" : "outline"}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={selectedCategory === cat.name ? "bg-[#F58220] hover:bg-[#D66D18]" : "border-gray-200"}
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                ) : (
                    filteredBusinesses.map((biz) => (
                        <BusinessCard key={biz.id} {...biz} />
                    ))
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
