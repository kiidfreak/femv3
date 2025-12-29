"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, getImageUrl } from "@/lib/api-client"
import {
    Upload,
    Image as ImageIcon,
    Loader2,
    Trash2,
    LayoutGrid,
    TrendingUp,
    ShieldCheck
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function BannerPage() {
    const [business, setBusiness] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchBusiness()
    }, [])

    const fetchBusiness = async () => {
        try {
            const res = await apiClient.businesses.myBusiness()
            if (res.ok) {
                const data = await res.json()
                setBusiness(data)
                if (data.business_image_url) {
                    setBannerPreview(data.business_image_url)
                }
            }
        } catch (error) {
            console.error("Failed to fetch business:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !business) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('business_image', file)

        try {
            const res = await apiClient.businesses.update(business.id, formData)

            if (res.ok) {
                toast.success("Banner image updated successfully")
                fetchBusiness()
            } else {
                const err = await res.json()
                toast.error(err.error || "Upload failed")
            }
        } catch (error) {
            toast.error("An error occurred during upload")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDelete = async () => {
        if (!confirm("Remove your banner image?")) return

        try {
            const formData = new FormData()
            formData.append('business_image', '')

            const res = await apiClient.businesses.update(business.id, formData)

            if (res.ok) {
                toast.success("Banner image removed")
                setBannerPreview(null)
                fetchBusiness()
            }
        } catch (error) {
            toast.error("Failed to delete banner")
        }
    }

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
    if (!business) return <div className="p-8 text-center text-red-500">Business profile not found.</div>

    return (
        <div className="container py-8 space-y-8 animate-fade-in-up max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Business Banner</h1>
                    <p className="text-gray-500 mt-2">Upload a banner image to appear on your business profile page.</p>
                </div>
            </div>

            {!bannerPreview ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <CardContent className="p-16 text-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <ImageIcon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">No banner image</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Upload a banner image to make your business profile stand out.</p>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="mt-8 bg-[#F58220] hover:bg-[#D66D18] text-white px-8 rounded-xl h-11 font-bold"
                        >
                            {isUploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Upload className="h-5 w-5 mr-2" />}
                            Upload Banner
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-none shadow-xl overflow-hidden">
                    <div className="relative w-full aspect-[3/1] max-h-96">
                        <Image
                            src={getImageUrl(bannerPreview) || bannerPreview}
                            alt="Business banner"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-white drop-shadow-lg">{business.business_name}</h2>
                                <p className="text-white/80 mt-1">Your banner image</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    variant="secondary"
                                    className="rounded-xl font-bold"
                                >
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                    Change
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    variant="destructive"
                                    className="rounded-xl font-bold"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Banner Tips */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
                {[
                    { title: 'Wide Format', desc: 'Use 1200x400px or similar wide aspect ratio for best results.', icon: LayoutGrid },
                    { title: 'First Impression', desc: 'Your banner is the first thing visitors see on your profile.', icon: TrendingUp },
                    { title: 'Brand Consistency', desc: 'Use colors and imagery that match your business identity.', icon: ShieldCheck },
                ].map((tip, i) => (
                    <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-50">
                        <div className="p-3 bg-orange-50 rounded-2xl h-fit">
                            <tip.icon className="h-6 w-6 text-[#F58220]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{tip.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{tip.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
