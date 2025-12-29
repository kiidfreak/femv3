"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, getImageUrl } from "@/lib/api-client"
import {
    Upload,
    X,
    Image as ImageIcon,
    Plus,
    Loader2,
    Trash2,
    Eye,
    LayoutGrid,
    CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function GalleryPage() {
    const [business, setBusiness] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
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
        formData.append('image', file)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v3'}/businesses/${business.id}/upload_image/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
                },
                body: formData
            })

            if (res.ok) {
                toast.success("Image uploaded to gallery")
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

    const handleDelete = async (imageId: number) => {
        if (!confirm("Remove this image from your gallery?")) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v3'}/businesses/${business.id}/delete_image/${imageId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
                }
            })

            if (res.ok) {
                toast.success("Image removed")
                fetchBusiness()
            }
        } catch (error) {
            toast.error("Failed to delete image")
        }
    }

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
    if (!business) return <div className="p-8 text-center text-red-500">Business profile not found.</div>

    const images = business.images || []

    return (
        <div className="container py-8 space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Business Gallery</h1>
                    <p className="text-gray-500 mt-2">Manage your business portfolio and showcase your work.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || images.length >= 10}
                        className="bg-[#F58220] hover:bg-[#D66D18] text-white px-6 h-12 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200"
                    >
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        Add Image
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

            {images.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <CardContent className="p-16 text-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <ImageIcon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Your gallery is empty</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Upload high-quality images of your products, workspace, or completed projects to build trust with customers.</p>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-8 border-gray-200 hover:border-[#F58220] hover:text-[#F58220] px-8 rounded-xl h-11 font-bold"
                        >
                            Upload First Image
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((img: any) => (
                        <Card key={img.id} className="border-none shadow-xl group relative overflow-hidden rounded-3xl aspect-square bg-white">
                            <Image
                                src={getImageUrl(img.image)}
                                alt={img.caption || 'Gallery image'}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(img.id)}
                                        className="rounded-lg h-9 w-9 p-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="flex-1"></div>
                                    <div className="h-9 w-9 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                                        <Eye className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Overlay Badge */}
                            <div className="absolute top-4 left-4 h-8 w-8 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                        </Card>
                    ))}

                    {images.length < 10 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-3xl aspect-square flex flex-col items-center justify-center gap-2 hover:border-[#F58220] hover:bg-orange-50/50 transition-all text-gray-400 hover:text-[#F58220]"
                        >
                            <Plus className="h-8 w-8" />
                            <span className="font-bold text-sm">Add More</span>
                        </button>
                    )}
                </div>
            )}

            {/* Gallery Tips */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
                {[
                    { title: 'Quality Matters', desc: 'Use high-resolution photos with good lighting.', icon: LayoutGrid },
                    { title: 'Show Results', desc: 'Before and after shots are great for service businesses.', icon: TrendingUp },
                    { title: 'Build Trust', desc: 'Photos of your team or storefront help humanize your brand.', icon: ShieldCheck },
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
