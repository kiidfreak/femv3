import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Clock, DollarSign, Store, ArrowRight, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface OfferingCardProps {
    id: number
    businessId: string
    businessName: string
    name: string
    description: string
    type: "product" | "service"
    price?: number
    priceCurrency?: string
    priceRange?: string
    duration?: string
    image?: string
}

export function OfferingCard({
    businessId,
    businessName,
    name,
    description,
    type,
    price,
    priceCurrency = "KES",
    priceRange,
    duration,
    image
}: OfferingCardProps) {
    return (
        <Card className="overflow-hidden group hover:border-[#F58220] hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white">
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                {image ? (
                    <Image src={image} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-200">
                        {type === "product" ? <Package className="h-16 w-16" /> : <Clock className="h-16 w-16" />}
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <Badge className={cn(
                        "font-bold px-2 py-1 gap-1 shadow-sm",
                        type === "product" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"
                    )}>
                        {type === "product" ? <Package className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {type === "product" ? "Product" : "Service"}
                    </Badge>
                </div>

                {/* Price Tag Overlay */}
                <div className="absolute bottom-3 right-3 z-10">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-100 flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                        <Tag className="h-3.5 w-3.5 text-[#F58220]" />
                        {type === "product" ? (
                            <span>{priceCurrency} {price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        ) : (
                            <span className="text-xs">{priceRange || "Price on request"}</span>
                        )}
                    </div>
                </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 hover:text-[#F58220] transition-colors">
                    <Store className="h-3 w-3" />
                    <Link href={`/business/${businessId}`}>{businessName}</Link>
                </div>

                <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#F58220] transition-colors mb-2 line-clamp-1">
                    {name}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
                    {description || "No description provided."}
                </p>

                {duration && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded-md">
                        <Clock className="h-3 w-3" />
                        {duration}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Link href={`/business/${businessId}`} className="w-full">
                    <Button variant="outline" className="w-full h-10 border-gray-100 group-hover:border-[#F58220] group-hover:bg-[#F58220]/5 group-hover:text-[#F58220] font-bold text-sm transition-all">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
