"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth"
import { apiClient, getImageUrl } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2, Upload, Building2, MapPin, Phone, Mail, Globe, Save } from "lucide-react"
import Image from "next/image"

interface Category {
    id: number
    name: string
    slug: string
}

export default function BusinessSettingsPage() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [business, setBusiness] = useState<any>(null)
    const [categories, setCategories] = useState<Category[]>([])

    // Form State
    const [formData, setFormData] = useState({
        business_name: "",
        description: "",
        category_id: "" as string | number,
        phone: "",
        email: "",
        website: "",
        address: "",
        city: "",
        county: ""
    })

    // Logo State
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiClient.get('/categories/')
                const catList = data.results || (Array.isArray(data) ? data : [])
                setCategories(catList)
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            }
        }

        const fetchBusiness = async () => {
            if (user?.user_type === 'business_owner') {
                setIsLoading(true)
                try {
                    const res = await apiClient.businesses.myBusiness()
                    if (res.ok) {
                        const data = await res.json()
                        setBusiness(data)

                        // Strip partnership number from description if it exists
                        let cleanDescription = data.description || ""
                        if (cleanDescription.includes("Partnership Number:")) {
                            cleanDescription = cleanDescription.split("\n\nPartnership Number:")[0]
                        }

                        setFormData({
                            business_name: data.business_name || "",
                            description: cleanDescription,
                            category_id: data.category?.id || "",
                            phone: data.phone || "",
                            email: data.email || "",
                            website: data.website || "",
                            address: data.address || "",
                            city: "",  // Backend doesn't have separate city field
                            county: ""  // Backend doesn't have separate county field
                        })
                        if (data.business_logo_url) {
                            setLogoPreview(data.business_logo_url)
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch business", error)
                    toast.error("Could not load business details")
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchCategories()
        if (user) fetchBusiness()
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleLogoClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        if (!business?.id) return

        setIsSaving(true)
        try {
            const data = new FormData()
            data.append('business_name', formData.business_name)
            data.append('description', formData.description)
            if (formData.category_id) data.append('category', String(formData.category_id))
            data.append('phone', formData.phone)
            data.append('email', formData.email)
            data.append('website', formData.website)
            // Backend has single address field, send full address
            let fullAddress = formData.address
            if (formData.city) {
                fullAddress += fullAddress ? `, ${formData.city}` : formData.city
            }
            if (formData.county) {
                fullAddress += fullAddress ? `, ${formData.county}` : formData.county
            }
            data.append('address', fullAddress)

            if (logoFile) {
                data.append('business_logo', logoFile)
            }

            const res = await apiClient.businesses.update(business.id, data)

            if (res.ok) {
                toast.success("Business profile updated successfully")
                const updatedData = await res.json()
                setBusiness(updatedData)
                if (updatedData.business_logo_url) {
                    setLogoPreview(updatedData.business_logo_url)
                }
                setLogoFile(null)
            } else {
                throw new Error("Failed to update")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to update business profile")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Loading business details...</p>
            </div>
        )
    }

    if (!user || user.user_type !== 'business_owner') {
        return (
            <div className="container py-12 text-center">
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-gray-500">Only business owners can access this page.</p>
            </div>
        )
    }

    return (
        <div className="container py-12 max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">My Business</h2>
                <p className="text-muted-foreground">Manage your public business profile and contact information.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Details displayed on your public directory listing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Logo Upload */}
                        <div className="grid gap-2">
                            <Label>Business Logo</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    onClick={handleLogoClick}
                                    className="relative w-24 h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#F58220] cursor-pointer transition-colors overflow-hidden group flex items-center justify-center"
                                >
                                    {logoPreview ? (
                                        <>
                                            <Image
                                                src={getImageUrl(logoPreview) || logoPreview}
                                                alt="Logo"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="h-6 w-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <Building2 className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{logoPreview ? 'Click to change' : 'Upload logo'}</p>
                                    <p className="text-xs text-gray-500">Recommended 500x500px. formats: JPG, PNG.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input
                                id="business_name"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category_id">Category</Label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F58220]"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Profile Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact & Location</CardTitle>
                        <CardDescription>How customers can find and reach you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="https://"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Street Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="county">County</Label>
                                <Input
                                    id="county"
                                    name="county"
                                    value={formData.county}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="bg-[#F58220] hover:bg-[#D66D18] min-w-[140px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
