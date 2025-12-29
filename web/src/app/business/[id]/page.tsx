"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    MapPin, Star, ShieldCheck, Heart, Share2,
    Package, Wrench, MessageSquare, Phone, Mail, Store,
    Image as ImageIcon, ChevronLeft
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
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
    images: { id: number, image: string, caption: string }[]
    is_favorite: boolean
}

interface Product {
    id: number
    name: string
    description: string
    price: string
    product_image_url?: string
    in_stock: boolean
    is_active: boolean
    is_favorite?: boolean
}

interface Service {
    id: number
    name: string
    description: string
    price_range: string
    duration: string
    service_image_url?: string
    is_active: boolean
    is_favorite?: boolean
}

interface Review {
    id: number
    user_name: string
    rating: number
    review_text: string
    created_at: string
    is_verified: boolean
    product_name?: string
    service_name?: string
}

export default function BusinessDetailPage() {
    const params = useParams()
    const [business, setBusiness] = useState<Business | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [isFavorite, setIsFavorite] = useState(false)
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
    const [comment, setComment] = useState("")
    const [currentProductId, setCurrentProductId] = useState<number | undefined>()
    const [currentServiceId, setCurrentServiceId] = useState<number | undefined>()
    const [selectedOffering, setSelectedOffering] = useState<any | null>(null)
    const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false)
    const [isReviewMode, setIsReviewMode] = useState(false)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
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
            // Assuming business.is_favorite is available from the API response
            // If not, you'd need a separate API call to check favorite status
            // For now, let's assume it's part of the business object
            // If it's not, this line will cause a type error or be undefined.
            // For the purpose of this edit, I'll assume it exists or handle it gracefully.
            // If `is_favorite` is not directly on `Business`, you might need to fetch it separately.
            // For now, I'll add a type assertion or check if it exists.
            // Let's assume the API response for Business includes `is_favorite` for logged-in users.
            if ('is_favorite' in business && typeof business.is_favorite === 'boolean') {
                setIsFavorite(business.is_favorite);
            }
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

    const toggleOfferingFavorite = async (offering: any) => {
        if (!user) {
            toast.error("Please login to save items")
            return
        }

        try {
            const payload: any = {}
            if (offering.type === 'product') payload.product = offering.id
            else payload.service = offering.id

            const res = await apiClient.favorites.toggle(payload)
            if (res.ok) {
                const data = await res.json()
                toast.success(data.is_favorite ? "Added to favorites" : "Removed from favorites")

                // Update the selectedOffering state to reflect the new favorite status
                setSelectedOffering({
                    ...offering,
                    is_favorite: data.is_favorite
                })

                // Update the offering in the main business state so the card also updates
                if (business) {
                    const updatedProducts = business.products?.map(p =>
                        p.id === offering.id && offering.type === 'product'
                            ? { ...p, is_favorite: data.is_favorite }
                            : p
                    )
                    const updatedServices = business.services?.map(s =>
                        s.id === offering.id && offering.type === 'service'
                            ? { ...s, is_favorite: data.is_favorite }
                            : s
                    )
                    setBusiness({
                        ...business,
                        products: updatedProducts,
                        services: updatedServices
                    })
                }
            }
        } catch (error) {
            toast.error("Failed to update favorites")
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
                <div className="relative group mb-8">
                    {business.business_image_url ? (
                        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src={getImageUrl(business.business_image_url) || business.business_image_url}
                                alt={`${business.business_name} banner`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">{business.business_name}</h1>
                                        {business.is_verified && (
                                            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/30">
                                                <ShieldCheck className="h-6 w-6 text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-white/90 font-medium">
                                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                            <MapPin className="h-4 w-4 text-orange-400" />
                                            <span className="text-sm">{business.address}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm">{business.rating} ({business.review_count} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Gallery Slider Section */}
                {business.images && business.images.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-2">
                                <ImageIcon className="h-6 w-6 text-[#F58220]" />
                                Business Gallery
                            </h2>
                            <div className="flex gap-2">
                                <div className="h-1 w-12 bg-[#F58220] rounded-full"></div>
                                <div className="h-1 w-4 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                            {business.images.map((img) => (
                                <div
                                    key={img.id}
                                    className="relative flex-shrink-0 w-72 md:w-96 aspect-[4/3] rounded-3xl overflow-hidden shadow-xl snap-center group/img"
                                >
                                    <Image
                                        src={getImageUrl(img.image)}
                                        alt={img.caption || 'Gallery image'}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-6">
                                        <p className="text-white text-sm font-bold">{img.caption || business.business_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                                unoptimized
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
                                <p className="text-gray-600 leading-relaxed">
                                    {business.description?.includes("Partnership Number:")
                                        ? business.description.split("Partnership Number:")[0].trim()
                                        : business.description}
                                </p>
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
                                <Card
                                    key={product.id}
                                    className="hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border-transparent hover:border-[#F58220]/30"
                                    onClick={() => {
                                        setSelectedOffering({ ...product, type: 'product' })
                                        setIsOfferingModalOpen(true)
                                    }}
                                >
                                    {product.product_image_url && (
                                        <div className="relative aspect-video overflow-hidden">
                                            <Image
                                                src={getImageUrl(product.product_image_url) || product.product_image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                unoptimized
                                            />
                                            {/* Review This Button - Center */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="secondary" size="sm" className="font-bold">
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    Review This
                                                </Button>
                                            </div>
                                            {/* Heart Icon - Top Right */}
                                            <button
                                                className={cn(
                                                    "absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all hover:bg-white z-20",
                                                    product.is_favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleOfferingFavorite({ ...product, type: 'product' })
                                                }}
                                            >
                                                <Heart className={cn("h-5 w-5", product.is_favorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
                                            </button>
                                        </div>
                                    )}
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg font-bold group-hover:text-[#F58220] transition-colors">{product.name}</CardTitle>
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
                                <Card
                                    key={service.id}
                                    className="hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col md:flex-row cursor-pointer border-transparent hover:border-[#F58220]/30"
                                    onClick={() => {
                                        setSelectedOffering({ ...service, type: 'service' })
                                        setIsOfferingModalOpen(true)
                                    }}
                                >
                                    {service.service_image_url && (
                                        <div className="relative w-full md:w-1/3 aspect-video md:aspect-square overflow-hidden shrink-0">
                                            <Image
                                                src={getImageUrl(service.service_image_url) || service.service_image_url}
                                                alt={service.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                unoptimized
                                            />
                                            {/* Review Icon - Center */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <MessageSquare className="h-6 w-6 text-white" />
                                            </div>
                                            {/* Heart Icon - Top Right */}
                                            <button
                                                className={cn(
                                                    "absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full transition-all hover:bg-white z-20",
                                                    service.is_favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleOfferingFavorite({ ...service, type: 'service' })
                                                }}
                                            >
                                                <Heart className={cn("h-5 w-5", service.is_favorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col">
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-lg font-bold group-hover:text-[#F58220] transition-colors">{service.name}</CardTitle>
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
                                    <Button
                                        className="bg-[#F58220] hover:bg-[#D66D18]"
                                        onClick={() => {
                                            setComment("")
                                            setIsReviewDialogOpen(true)
                                        }}
                                    >
                                        Write a Review
                                    </Button>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Share your experience</DialogTitle>
                                            <DialogDescription>
                                                Your review helps others in the community discover great businesses.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ReviewForm
                                            businessId={params.id as string}
                                            productId={currentProductId}
                                            serviceId={currentServiceId}
                                            comment={comment}
                                            setComment={setComment}
                                            onSuccess={() => {
                                                setIsReviewDialogOpen(false)
                                                setComment("")
                                                setCurrentProductId(undefined)
                                                setCurrentServiceId(undefined)
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
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-bold text-sm">{review.user_name}</div>
                                                                {(review.product_name || review.service_name) && (
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[#F58220]/20 text-[#F58220] bg-orange-50/50">
                                                                        {review.product_name || review.service_name}
                                                                    </Badge>
                                                                )}
                                                            </div>
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
                                            onClick={() => {
                                                setComment("")
                                                setIsReviewDialogOpen(true)
                                            }}
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

                {/* Offering Detail / Gallery Modal */}
                <Dialog open={isOfferingModalOpen} onOpenChange={(open) => {
                    setIsOfferingModalOpen(open)
                    if (!open) {
                        setIsReviewMode(false)
                        setIsDescriptionExpanded(false)
                        setComment("")
                    }
                }}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
                        {selectedOffering && (
                            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                                {/* Image Section */}
                                <div className="relative w-full md:w-3/5 bg-gray-900 aspect-video md:aspect-auto flex items-center justify-center">
                                    {(selectedOffering.product_image_url || selectedOffering.service_image_url) ? (
                                        <Image
                                            src={getImageUrl(selectedOffering.product_image_url || selectedOffering.service_image_url)}
                                            alt={selectedOffering.name}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    ) : (
                                        <Package className="h-20 w-20 text-gray-700" />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-white/90 backdrop-blur-md text-[#F58220] border-none font-bold uppercase tracking-wider text-[10px] px-3">
                                            {selectedOffering.type}
                                        </Badge>
                                    </div>

                                    {/* Top Right Heart Action */}
                                    <button
                                        onClick={() => toggleOfferingFavorite(selectedOffering)}
                                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all group/fav"
                                    >
                                        <Heart
                                            className={cn(
                                                "h-5 w-5 transition-colors",
                                                selectedOffering.is_favorite
                                                    ? "fill-red-500 text-red-500"
                                                    : "text-gray-400 group-hover/fav:text-red-500"
                                            )}
                                        />
                                    </button>
                                </div>

                                {/* Details Section */}
                                <div className="flex-1 p-8 flex flex-col justify-between bg-white overflow-y-auto">
                                    {isReviewMode ? (
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-0 hover:bg-transparent -ml-2 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setIsReviewMode(false)}
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                                    Back to details
                                                </Button>
                                            </div>
                                            <h3 className="text-xl font-bold mb-4">Review {selectedOffering.name}</h3>
                                            <ReviewForm
                                                businessId={params.id as string}
                                                productId={selectedOffering.type === 'product' ? selectedOffering.id : undefined}
                                                serviceId={selectedOffering.type === 'service' ? selectedOffering.id : undefined}
                                                comment={comment}
                                                setComment={setComment}
                                                onSuccess={() => {
                                                    setIsReviewMode(false)
                                                    setComment("")
                                                    // Refresh reviews
                                                    apiClient.reviews.list(`business_id=${params.id}`)
                                                        .then(res => res.json())
                                                        .then(data => setReviews(data.results || data))
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <DialogHeader className="mb-4 space-y-0">
                                                    <DialogTitle className="text-3xl font-black text-[#1A1A1A] leading-tight">{selectedOffering.name}</DialogTitle>
                                                    <DialogDescription className="sr-only">
                                                        Detailed view of {selectedOffering.name}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <span className="text-2xl font-black text-[#F58220]">
                                                        {selectedOffering.type === 'product'
                                                            ? `KES ${parseFloat(selectedOffering.price).toLocaleString()}`
                                                            : selectedOffering.price_range
                                                        }
                                                    </span>
                                                    {selectedOffering.duration && (
                                                        <Badge variant="outline" className="border-gray-200 text-gray-500 rounded-lg">
                                                            {selectedOffering.duration}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <p className={cn("text-gray-600 leading-relaxed mb-2", !isDescriptionExpanded && "line-clamp-4")}>
                                                        {selectedOffering.description}
                                                    </p>
                                                    {selectedOffering.description && selectedOffering.description.length > 200 && (
                                                        <button
                                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                            className="text-[#F58220] text-sm font-semibold hover:underline focus:outline-none"
                                                        >
                                                            {isDescriptionExpanded ? "Read Less" : "Read More"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4 mt-8">
                                                <div className="flex gap-3">
                                                    <Button
                                                        className="flex-1 bg-[#F58220] hover:bg-[#D66D18] h-14 rounded-2xl font-bold gap-2 text-lg shadow-lg shadow-orange-100"
                                                        onClick={() => {
                                                            setComment(`Regarding ${selectedOffering.name}: `)
                                                            setIsReviewMode(true)
                                                        }}
                                                    >
                                                        <MessageSquare className="h-5 w-5" />
                                                        Review This
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "h-14 px-6 rounded-2xl border-2 transition-all font-bold gap-2",
                                                            selectedOffering.is_favorite
                                                                ? "bg-red-50 text-red-500 border-red-200"
                                                                : "hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                                        )}
                                                        onClick={() => toggleOfferingFavorite(selectedOffering)}
                                                    >
                                                        <Heart className={cn("h-5 w-5", selectedOffering.is_favorite && "fill-red-500")} />
                                                        {selectedOffering.is_favorite ? "Saved" : "Save"}
                                                    </Button>
                                                </div>
                                                <p className="text-center text-[11px] text-gray-400 font-medium">
                                                    Community members get priority support and trusted reviews.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

function ReviewForm({
    businessId,
    productId,
    serviceId,
    comment,
    setComment,
    onSuccess
}: {
    businessId: string;
    productId?: number;
    serviceId?: number;
    comment: string;
    setComment: (v: string) => void;
    onSuccess: () => void
}) {
    const [rating, setRating] = useState(5)
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
                product: productId,
                service: serviceId,
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
