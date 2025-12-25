"use client"

import { useState, useEffect } from "react"
import { BusinessCard } from "@/components/directory/BusinessCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function DirectoryPage() {
    const [loading, setLoading] = useState(true)
    const [businesses, setBusinesses] = useState<any[]>([])

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true)
            try {
                const response = await fetch('http://localhost:8000/api/v3/businesses/')
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()

                // Map backend data to frontend props
                const mappedData = data.map((biz: any) => ({
                    id: biz.id,
                    name: biz.business_name,
                    category: biz.category_name || 'Business',
                    location: biz.address,
                    rating: parseFloat(biz.rating) || 0,
                    reviews: biz.review_count || 0,
                    verified: biz.is_verified || false,
                    productCount: biz.products?.length || 0,
                    serviceCount: biz.services?.length || 0
                }))

                setBusinesses(mappedData)
            } catch (error) {
                console.error("Failed to fetch businesses", error)
            } finally {
                setLoading(false)
            }
        }
        fetchBusinesses()
    }, [])

    return (
        <div className="container py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-[#1A1A1A]">Business Directory</h1>
                    <p className="text-gray-500 mt-2">Find and support trusted businesses in our community.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input className="pl-10" placeholder="Search businesses..." />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" /> Filters
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "Transportation", "Events", "IT & Design", "Home", "Health", "Construction"].map((cat) => (
                    <Button
                        key={cat}
                        variant={cat === "All" ? "default" : "outline"}
                        className={cat === "All" ? "bg-[#F58220] hover:bg-[#D66D18]" : "border-gray-200"}
                    >
                        {cat}
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
                    businesses.map((biz) => (
                        <BusinessCard key={biz.id} {...biz} />
                    ))
                )}
            </div>
        </div>
    )
}
