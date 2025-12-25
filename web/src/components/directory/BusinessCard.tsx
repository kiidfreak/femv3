import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, MapPin, Star, Package, Wrench } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
    serviceCount = 0
}: BusinessCardProps) {
    return (
        <Link href={`/business/${id}`}>
            <Card className="overflow-hidden group hover:border-[#F58220] hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative aspect-video">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        {image ? (
                            <Image src={image} alt={name} fill className="object-cover" />
                        ) : (
                            <div className="text-gray-400 font-bold text-4xl">{name[0]}</div>
                        )}
                    </div>
                    {verified && (
                        <Badge className="absolute top-2 right-2 bg-white text-green-600 hover:bg-white border-none shadow-sm gap-1">
                            <ShieldCheck className="h-3 w-3" /> Church Verified
                        </Badge>
                    )}
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
