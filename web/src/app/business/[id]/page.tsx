"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    MapPin, Star, ShieldCheck, Heart, Share2,
    Package, Wrench, MessageSquare, Phone, Mail, Store
} from "lucide-react"
import { toast } from "sonner"
import { apiClient, getImageUrl } from "@/lib/api-client"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth"
import { Label } from "@/components/ui/label"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Business {
    id: string
    business_name: string
    description: string
    address: string
    category_name: string
    is_verified: boolean
    rating: number
    review_count: number
    business_image_url?: string
    business_logo_url?: string
    products: Product[]
    services: Service[]
}

interface Product {
    id: number
    name: string
    description: string
    price: string
    product_image_url?: string
    in_stock: boolean
    is_active: boolean
}

interface Service {
    id: number
    name: string
    description: string
    price_range: string
    duration: string
    service_image_url?: string
    is_active: boolean
}

interface Review {
    id: number
    user_name: string
    rating: number
    review_text: string
    created_at: string
    is_verified: boolean
}

export default function BusinessDetailPage() {
    const params = useParams()
    const [business, setBusiness] = useState<Business | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [isFavorite, setIsFavorite] = useState(false)
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const [bizRes, revRes] = await Promise.all([
                    apiClient.businesses.get(params.id as string),
                    apiClient.reviews.list(`business_id=${params.id}`)
                ])

                if (bizRes.ok) {
                    const data = await bizRes.json()
                    setBusiness(data)
                    // Increment view count
                    apiClient.businesses.incrementView(params.id as string).catch(console.error)
                }

                if (revRes.ok) {
                    const revData = await revRes.json()
                    setReviews(revData.results || revData)
                }
            } catch (error) {
                console.error("Failed to fetch business:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchBusiness()
        }
    }, [params.id])

    useEffect(() => {
        if (business) {
            setIsFavorite(business.is_favorite)
        }
    }, [business])

    const handleShare = () => {
        const url = window.location.href
        if (navigator.share) {
            navigator.share({
                title: business?.business_name,
                text: business?.description,
                url: url,
            })
        } else {
            navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        }
    }

    const toggleFavorite = async () => {
        if (!user) {
            toast.error("Please login to save items", {
                description: "Create an account to save your favorite offerings."
            })
            return
        }

        try {
            const newStatus = !isFavorite
            setIsFavorite(newStatus)

            const res = await apiClient.favorites.toggle({ business: business?.id })
            if (res.ok) {
                const data = await res.json()
                setIsFavorite(data.is_favorite)
                toast.success(data.is_favorite ? "Added to favorites" : "Removed from favorites")
            } else {
                setIsFavorite(!newStatus)
                toast.error("Failed to update favorites")
            }
        } catch (error) {
            setIsFavorite(isFavorite)
            toast.error("An error occurred")
        }
    }

    if (loading) {
        return (
            <div className="container py-24 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#F58220] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading business details...</p>
                </div>
            </div>
        )
    }

    if (!business) {
        return (
            <div className="container py-24 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-500">The business you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container max-w-6xl">
                {/* Hero & Banner Section */}
                {business.business_image_url && (
                    <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 shadow-md">
                        <Image
                            src={getImageUrl(business.business_image_url) || business.business_image_url}
                            alt={`${business.business_name} banner`}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                )}

                <Card className="mb-6 border-none shadow-lg overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="h-20 w-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-sm">
                                        {business.business_logo_url ? (
                                            <Image
                                                src={getImageUrl(business.business_logo_url) || business.business_logo_url}
                                                alt={`${business.business_name} logo`}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <Store className="h-8 w-8 text-[#F58220] opacity-40 mb-1" />
                                                <span className="text-2xl font-bold text-[#F58220]">
                                                    {business.business_name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h1 className="text-3xl font-bold text-[#1A1A1A]">{business.business_name}</h1>
                                            {business.is_verified && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <ShieldCheck className="h-6 w-6 text-green-600 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>Verified Business</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <Badge className="bg-[#F58220]/10 text-[#F58220] hover:bg-[#F58220]/20 border-none px-3 py-1">
                                                {business.category_name}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{business.rating}</span>
                                                <span>({business.review_count} reviews)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{business.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed">{business.description}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex md:flex-col gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleFavorite}
                                    className={isFavorite ? "border-red-500 text-red-500" : ""}
                                >
                                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500" : ""}`} />
                                    {isFavorite ? "Saved" : "Save"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleShare}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Products, Services, Reviews */}
                <Tabs defaultValue="products" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="products">
                            <Package className="h-4 w-4 mr-2" />
                            Products ({business.products?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="services">
                            <Wrench className="h-4 w-4 mr-2" />
                            Services ({business.services?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="reviews">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Reviews ({business.review_count})
                        </TabsTrigger>
                    </TabsList>

                    {/* Products Tab */}
                    <TabsContent value="products">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {business.products?.map((product) => (
                                <Card key={product.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                    {product.product_image_url && (
                                        <div className="relative aspect-video overflow-hidden">
                                            <Image
                                                src={getImageUrl(product.product_image_url) || product.product_image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-[#F58220]">
                                                KES {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <Badge className={product.in_stock ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-100 text-gray-600"}>
                                                {product.in_stock ? "In Stock" : "Out of Stock"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {(!business.products || business.products.length === 0) && (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    No products available yet
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Services Tab */}
                    <TabsContent value="services">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {business.services?.map((service) => (
                                <Card key={service.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col md:flex-row">
                                    {service.service_image_url && (
                                        <div className="relative w-full md:w-1/3 aspect-video md:aspect-square overflow-hidden shrink-0">
                                            <Image
                                                src={getImageUrl(service.service_image_url) || service.service_image_url}
                                                alt={service.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col">
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-lg font-bold">{service.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 flex-1">
                                            <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-1 bg-[#F58220]/5 text-[#F58220] rounded-lg font-bold">
                                                        {service.price_range}
                                                    </span>
                                                </div>
                                                {service.duration && (
                                                    <div className="flex items-center gap-1.5 text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-lg">
                                                        <Star className="h-3.5 w-3.5 opacity-40 shrink-0" />
                                                        <span>{service.duration}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))}
                            {(!business.services || business.services.length === 0) && (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    No services available yet
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Community Reviews</h3>
                                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[#F58220] hover:bg-[#D66D18]">
                                            Write a Review
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Share your experience</DialogTitle>
                                            <DialogDescription>
                                                Your review helps others in the community discover great businesses.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ReviewForm
                                            businessId={params.id as string}
                                            onSuccess={() => {
                                                setIsReviewDialogOpen(false)
                                                // Refresh reviews
                                                apiClient.reviews.list(`business_id=${params.id}`)
                                                    .then(res => res.json())
                                                    .then(data => setReviews(data.results || data))
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-4">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <Card key={review.id} className="border-gray-100">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-[#F58220]/10 flex items-center justify-center font-bold text-[#F58220]">
                                                            {review.user_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">{review.user_name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "h-4 w-4",
                                                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 italic">"{review.review_text}"</p>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-100">
                                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                                        <p className="text-gray-500 mb-6">Be the first to share your experience with {business.business_name}.</p>
                                        <Button
                                            onClick={() => setIsReviewDialogOpen(true)}
                                            variant="outline"
                                            className="border-[#F58220] text-[#F58220] hover:bg-[#F58220]/5"
                                        >
                                            Write the First Review
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function ReviewForm({ businessId, onSuccess }: { businessId: string; onSuccess: () => void }) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error("Please login to write a review")
            return
        }

        setLoading(true)
        try {
            const res = await apiClient.reviews.save({
                business: businessId,
                rating,
                review_text: comment
            })

            if (res.ok) {
                toast.success("Review submitted! Thank you for your feedback.")
                onSuccess()
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || "Failed to submit review")
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2 text-center">
                <Label className="text-base">Your Rating</Label>
                <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-125 focus:outline-none"
                        >
                            <Star
                                className={cn(
                                    "h-8 w-8 transition-colors",
                                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">Your Experience</Label>
                <Textarea
                    id="comment"
                    placeholder="Tell others what you think..."
                    className="min-h-[120px]"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-[#F58220] hover:bg-[#D66D18] h-12 text-lg font-bold"
                disabled={loading}
            >
                {loading ? "Submitting..." : "Submit Review"}
            </Button>
        </form>
    )
}
