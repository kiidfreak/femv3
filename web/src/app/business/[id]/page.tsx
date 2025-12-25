"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    MapPin, Star, ShieldCheck, Heart, Share2,
    Package, Wrench, MessageSquare, Phone, Mail
} from "lucide-react"
import { toast } from "sonner"

interface Business {
    id: string
    business_name: string
    description: string
    address: string
    category_name: string
    is_verified: boolean
    rating: number
    review_count: number
    products: Product[]
    services: Service[]
}

interface Product {
    id: number
    name: string
    description: string
    price: string
    in_stock: boolean
    is_active: boolean
}

interface Service {
    id: number
    name: string
    description: string
    price_range: string
    duration: string
    is_active: boolean
}

export default function BusinessDetailPage() {
    const params = useParams()
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFavorite, setIsFavorite] = useState(false)

    useEffect(() => {
        fetchBusiness()
    }, [params.id])

    const fetchBusiness = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v3/businesses/${params.id}/`)
            if (!response.ok) throw new Error("Failed to fetch business")
            const data = await response.json()
            setBusiness(data)
        } catch (error) {
            toast.error("Failed to load business details")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

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

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite)
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
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
                {/* Hero Section */}
                <Card className="mb-6 border-none shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="h-16 w-16 rounded-full bg-[#F58220]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl font-bold text-[#F58220]">
                                            {business.business_name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h1 className="text-3xl font-bold text-gray-900">{business.business_name}</h1>
                                            {business.is_verified && (
                                                <ShieldCheck className="h-6 w-6 text-green-600" />
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="mb-2">
                                            {business.category_name}
                                        </Badge>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{product.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-[#F58220]">
                                                KES {parseFloat(product.price).toLocaleString()}
                                            </span>
                                            <Badge variant={product.in_stock ? "default" : "secondary"}>
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
                                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{service.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <div>
                                                <span className="text-gray-500">Price: </span>
                                                <span className="font-semibold text-[#F58220]">{service.price_range}</span>
                                            </div>
                                            {service.duration && (
                                                <div>
                                                    <span className="text-gray-500">Duration: </span>
                                                    <span className="font-semibold">{service.duration}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
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
                        <Card>
                            <CardContent className="p-8">
                                <div className="text-center py-12">
                                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews Coming Soon</h3>
                                    <p className="text-gray-500 mb-6">
                                        Review functionality will be available soon. Stay tuned!
                                    </p>
                                    <Button className="bg-[#F58220] hover:bg-[#D66D18]">
                                        Be the First to Review
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
