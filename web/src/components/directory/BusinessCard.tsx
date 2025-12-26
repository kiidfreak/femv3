import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, MapPin, Star, Package, Wrench, Heart, Store } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { getImageUrl, apiClient } from "@/lib/api-client"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface BusinessCardProps {
    id: string
    name: string
    category: string
    location: string
    rating: number
    reviews: number
    verified: boolean
    image?: string
    productCount?: number
    serviceCount?: number
}

export function BusinessCard({
    id,
    name,
    category,
    location,
    rating,
    reviews,
    verified,
    image,
    productCount = 0,
    serviceCount = 0,
    isInitialFavorite = false
}: BusinessCardProps & { isInitialFavorite?: boolean }) {
    const [isFavorite, setIsFavorite] = useState(isInitialFavorite)
    const { user } = useAuth()

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            toast.error("Please login to save businesses", {
                description: "Create an account to save your favorite businesses."
            })
            return
        }

        try {
            // Optimistic update
            const newStatus = !isFavorite
            setIsFavorite(newStatus)

            const res = await apiClient.favorites.toggle({ business: id })
            if (res.ok) {
                const data = await res.json()
                setIsFavorite(data.is_favorite)
                toast.success(data.is_favorite ? "Added to favorites" : "Removed from favorites")
            } else {
                // Rollback
                setIsFavorite(!newStatus)
                toast.error("Failed to update favorites")
            }
        } catch (error) {
            setIsFavorite(isFavorite)
            toast.error("An error occurred")
        }
    }

    return (
        <Link href={`/business/${id}`}>
            <Card className="overflow-hidden group hover:border-[#F58220] hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                <div className="relative aspect-video bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        {image ? (
                            <Image
                                src={getImageUrl(image) || image}
                                alt={name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                unoptimized={image?.includes('cloudfront.net') || image?.includes('cdn.corenexis.com')}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <Store className="h-10 w-10 mb-1 opacity-20" />
                                <span className="text-2xl font-bold opacity-30">{name?.charAt(0) || '?'}</span>
                            </div>
                        )}
                    </div>

                    {/* Badge Overlay - Top Left */}
                    {verified && (
                        <div className="absolute top-3 left-3 z-10">
                            <Badge className="bg-white/95 text-green-700 hover:bg-white border-green-100 shadow-sm gap-1.5 px-2.5 py-1 backdrop-blur-sm">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold">Verified</span>
                            </Badge>
                        </div>
                    )}

                    {/* Favorite Toggle - Top Right */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleFavorite}
                                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 shadow-sm backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                                >
                                    <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{user ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login to save"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Dark Gradient Overlay for text contrast if needed later */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/10 transition-colors duration-300" />
                </div>
                <CardContent className="p-4">
                    <div className="text-sm text-[#F58220] font-medium mb-1">{category}</div>
                    <h3 className="font-bold text-[#1A1A1A] group-hover:text-[#F58220] transition-colors">{name}</h3>
                    <div className="flex items-center text-gray-500 text-xs mt-2 gap-1">
                        <MapPin className="h-3 w-3" /> {location}
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                        <Star className="h-3 w-3 fill-[#F58220] text-[#F58220]" />
                        <span className="text-sm font-bold text-[#1A1A1A]">{rating}</span>
                        <span className="text-gray-400 text-xs">({reviews} reviews)</span>
                    </div>
                    {(productCount > 0 || serviceCount > 0) && (
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
                            {productCount > 0 && (
                                <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    <span>{productCount} products</span>
                                </div>
                            )}
                            {serviceCount > 0 && (
                                <div className="flex items-center gap-1">
                                    <Wrench className="h-3 w-3" />
                                    <span>{serviceCount} services</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full text-xs h-8 border-gray-200 group-hover:border-[#F58220] group-hover:text-[#F58220] group-hover:bg-[#F58220]/5">
                        View Details
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
