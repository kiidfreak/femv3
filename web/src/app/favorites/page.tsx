"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Search, MapPin, Star } from "lucide-react" // Import generic icons
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { BusinessCard } from "@/components/directory/BusinessCard"
import { OfferingCard } from "@/components/directory/OfferingCard"
import { Skeleton } from "@/components/ui/skeleton"

export default function FavoritesPage() {
    const { user } = useAuth()
    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFavorites = async () => {
        try {
            const res = await apiClient.favorites.list()
            if (res.ok) {
                const data = await res.json()
                setFavorites(data.results || data)
            }
        } catch (error) {
            console.error("Failed to fetch favorites:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchFavorites()
        } else {
            setLoading(false)
        }
    }, [user])

    return (
        <div className="container py-12 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-[#1A1A1A]">My Favorites</h1>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                </div>
            ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.map(fav => {
                        if (fav.business) {
                            return (
                                <BusinessCard
                                    key={`biz-${fav.id}`}
                                    id={fav.business}
                                    name={fav.business_name}
                                    category={fav.category_name}
                                    location=""
                                    rating={0}
                                    reviews={0}
                                    verified={false}
                                    isInitialFavorite={true}
                                />
                            )
                        } else {
                            return (
                                <OfferingCard
                                    key={`off-${fav.id}`}
                                    id={fav.product || fav.service}
                                    businessId=""
                                    businessName={fav.business_name}
                                    name={fav.product_name || fav.service_name}
                                    description=""
                                    type={fav.product ? "product" : "service"}
                                    isInitialFavorite={true}
                                />
                            )
                        }
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Save businesses you love to easily find them later. Browse our directory to discover trusted partners.
                    </p>
                    <Link href="/directory">
                        <Button className="bg-[#F58220] hover:bg-[#D66D18] text-white">
                            Browse Directory
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
