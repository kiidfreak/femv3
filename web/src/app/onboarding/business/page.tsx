"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
    Building2, MapPin, Phone, Mail, Globe,
    Upload, ArrowRight, ArrowLeft, Check,
    Star, Clock, Image as ImageIcon, Loader2
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"

interface BusinessData {
    business_name: string
    description: string
    category: string
    category_id: number | null
    partnership_number: string
    phone: string
    email: string
    website: string
    address: string
    city: string
    county: string
}

interface Category {
    id: number
    name: string
    slug: string
}

export default function BusinessOnboardingPage() {
    const router = useRouter()
    const { user, updateUser } = useAuth()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])

    // Logo State
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleLogoClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    // Fetch categories on mount
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
        fetchCategories()
    }, [])

    const [businessData, setBusinessData] = useState<BusinessData>({
        business_name: "",
        description: "",
        category: "",
        category_id: null,
        partnership_number: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        city: "",
        county: ""
    })

    // Prefill data from user profile
    useEffect(() => {
        if (user) {
            setBusinessData(prev => ({
                ...prev,
                phone: user.phone || prev.phone,
                email: user.email || prev.email,
                partnership_number: user.partnership_number || prev.partnership_number
            }))
        }
    }, [user])

    const totalSteps = 4
    const progress = (step / totalSteps) * 100

    const handleNext = () => {
        if (step === 1) {
            if (!businessData.business_name) {
                toast.error("Please enter a business name")
                return
            }
            if (!businessData.category_id) {
                toast.error("Please select a category")
                return
            }
        }

        if (step < totalSteps) setStep(step + 1)
        else handleSubmit()
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            console.log("Submitting Business:", businessData)

            // Append partnership number to description since it's not in the model yet
            let finalDescription = businessData.description
            if (businessData.partnership_number) {
                finalDescription += `\n\nPartnership Number: ${businessData.partnership_number}`
            }

            const formData = new FormData()
            formData.append('business_name', businessData.business_name)
            formData.append('description', finalDescription)
            formData.append('category', businessData.category_id?.toString() || '')
            formData.append('phone', businessData.phone)
            formData.append('email', businessData.email)
            formData.append('website', businessData.website)
            formData.append('address', `${businessData.address}, ${businessData.city}, ${businessData.county}`)

            if (logoFile) {
                // Must match the serializer field name 'business_logo' (mapped from business_logo_url but upload expects field name)
                formData.append('business_logo', logoFile)
            }

            const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token')) : null
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v3"
            const res = await fetch(`${API_URL}/businesses/`, {
                method: 'POST',
                headers: headers,
                body: formData
            })

            if (res.ok) {
                // Update local user state to reflect they now have a business
                updateUser({ has_business_profile: true })
                toast.success("Business profile created successfully!")
                router.push("/dashboard?highlight=catalog")
            } else {
                const errorData = await res.json()
                // Check if we have field-specific errors
                let errorMessage = "Failed to create business profile"
                const fieldErrors = Object.keys(errorData).filter(key => Array.isArray(errorData[key]))
                if (fieldErrors.length > 0) {
                    // Extract first error from first field
                    const firstField = fieldErrors[0]
                    errorMessage = `${firstField.charAt(0).toUpperCase() + firstField.slice(1)}: ${errorData[firstField][0]}`
                } else if (errorData.error) {
                    errorMessage = errorData.error
                } else if (errorData.detail) {
                    errorMessage = errorData.detail
                }
                toast.error(errorMessage)
            }
        } catch (error: any) {
            console.error("Failed to create business:", error)
            toast.error("An unexpected error occurred. Please check your connection.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value)
        const selectedCategory = categories.find(c => c.id === selectedId)

        if (selectedCategory) {
            setBusinessData({
                ...businessData,
                category: selectedCategory.name,
                category_id: selectedCategory.id
            })
        } else {
            setBusinessData({
                ...businessData,
                category: "",
                category_id: null
            })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 z-40">
                <div
                    className="h-full bg-[#F58220] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Main Form - 2/3 width */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-2">Step {step} of {totalSteps}</p>
                            <h1 className="text-3xl font-bold text-[#1A1A1A]">
                                {step === 1 && "Basic Information"}
                                {step === 2 && "Contact Details"}
                                {step === 3 && "Location"}
                                {step === 4 && "Review & Publish"}
                            </h1>
                        </div>

                        <Card className="border-none shadow-xl">
                            <CardContent className="p-8">
                                {/* Step 1: Basic Info */}
                                {step === 1 && (
                                    <div className="space-y-6 animate-fade-in-up">
                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block">
                                                Business Name *
                                            </label>
                                            <Input
                                                placeholder="e.g., Grace Coffee Shop"
                                                value={businessData.business_name}
                                                onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                                                className="h-12 text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block">
                                                Category *
                                            </label>
                                            <select
                                                value={businessData.category_id || ""}
                                                onChange={handleCategoryChange}
                                                className="w-full h-12 px-3 border border-gray-200 rounded-xl text-lg bg-white"
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block">
                                                Partnership Number (Optional)
                                            </label>
                                            <Input
                                                placeholder="e.g., P-12345"
                                                value={businessData.partnership_number}
                                                onChange={(e) => setBusinessData({ ...businessData, partnership_number: e.target.value })}
                                                className="h-12 text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block">
                                                Business Description *
                                            </label>
                                            <Textarea
                                                placeholder="Tell us about your business, what makes it special, and how it serves the faith community..."
                                                value={businessData.description}
                                                onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                                                className="min-h-32 text-lg"
                                                maxLength={500}
                                            />
                                            <p className="text-xs text-gray-500 mt-2">{businessData.description.length}/500 characters</p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Contact */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-fade-in-up">
                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block flex items-center gap-2">
                                                <Phone className="h-4 w-4" /> Phone Number *
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="07XX XXX XXX"
                                                value={businessData.phone}
                                                onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                                                className="h-12 text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block flex items-center gap-2">
                                                <Mail className="h-4 w-4" /> Email Address *
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="contact@yourbusiness.com"
                                                value={businessData.email}
                                                onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                                                className="h-12 text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block flex items-center gap-2">
                                                <Globe className="h-4 w-4" /> Website (Optional)
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://www.yourbusiness.com"
                                                value={businessData.website}
                                                onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                                                className="h-12 text-lg"
                                            />
                                            <p className="text-xs text-gray-500 mt-1 ml-1">Must start with http:// or https://</p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Location */}
                                {step === 3 && (
                                    <div className="space-y-6 animate-fade-in-up">
                                        <div>
                                            <label className="text-sm font-bold text-[#1A1A1A] mb-2 block flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Street Address *
                                            </label>
                                            <Input
                                                placeholder="123 Main Street"
                                                value={businessData.address}
                                                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                                                className="h-12 text-lg"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-bold text-[#1A1A1A] mb-2 block">
                                                    City *
                                                </label>
                                                <Input
                                                    placeholder="Nairobi"
                                                    value={businessData.city}
                                                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                                                    className="h-12"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-[#1A1A1A] mb-2 block">
                                                    County *
                                                </label>
                                                <Input
                                                    placeholder="Nairobi"
                                                    value={businessData.county}
                                                    onChange={(e) => setBusinessData({ ...businessData, county: e.target.value })}
                                                    className="h-12"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Review */}
                                {step === 4 && (
                                    <div className="space-y-6 animate-fade-in-up">
                                        <div className="bg-gradient-to-br from-[#F58220]/10 via-[#F58220]/5 to-transparent border border-[#F58220]/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-full bg-[#F58220] flex items-center justify-center animate-pulse">
                                                    <Check className="h-6 w-6 text-white" />
                                                </div>
                                                <h3 className="text-lg font-bold text-[#1A1A1A]">Almost Done!</h3>
                                            </div>
                                            <p className="text-gray-700 mb-4">
                                                Your business profile is ready to publish. Review the details on the right and click "Publish Profile" when you're ready.
                                            </p>

                                            {/* Logo Upload in Review Step */}
                                            <div className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-[#F58220]/20">
                                                <div
                                                    className="h-16 w-16 bg-white rounded-lg border-2 border-dashed border-[#F58220]/50 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                                                    onClick={handleLogoClick}
                                                >
                                                    {logoPreview ? (
                                                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Upload className="h-6 w-6 text-[#F58220]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1A1A1A]">
                                                        {logoPreview ? "Business Logo Added" : "Add a Business Logo"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {logoPreview ? "Click image to change" : "helps customers recognize you"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h4 className="font-bold text-[#1A1A1A] mb-4">What happens next?</h4>
                                            <ul className="space-y-3 text-gray-600">
                                                <li className="flex gap-3">
                                                    <div className="h-6 w-6 rounded-full bg-[#F58220]/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-4 w-4 text-[#F58220]" />
                                                    </div>
                                                    Your profile will be visible to the community immediately
                                                </li>
                                                <li className="flex gap-3">
                                                    <div className="h-6 w-6 rounded-full bg-[#F58220]/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-4 w-4 text-[#F58220]" />
                                                    </div>
                                                    You can apply for church verification to earn trust badges
                                                </li>
                                                <li className="flex gap-3">
                                                    <div className="h-6 w-6 rounded-full bg-[#F58220]/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="h-4 w-4 text-[#F58220]" />
                                                    </div>
                                                    Start receiving reviews and building your reputation
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t">
                                    <Button
                                        onClick={handleBack}
                                        variant="ghost"
                                        disabled={step === 1 || isLoading}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={isLoading}
                                        className="bg-[#F58220] hover:bg-[#D66D18] text-white px-8 flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                {step === totalSteps ? "Publish Profile" : "Continue"}
                                                {step < totalSteps && <ArrowRight className="h-4 w-4" />}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Live Preview Sidebar - 1/3 width */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Live Preview</h3>
                            <Card className="border-none shadow-xl overflow-hidden">
                                <div className="h-32 bg-gradient-to-br from-[#F58220]/20 to-[#F58220]/5" />
                                <CardContent className="p-6 -mt-12">
                                    <div
                                        className="bg-white h-20 w-20 rounded-xl shadow-lg flex items-center justify-center mb-4 border-4 border-white cursor-pointer relative overflow-hidden group"
                                        onClick={handleLogoClick}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <Building2 className="h-10 w-10 text-[#F58220]" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="h-6 w-6 text-white" />
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
                                        {businessData.business_name || "Your Business Name"}
                                    </h2>

                                    {businessData.category && (
                                        <span className="inline-block px-3 py-1 bg-[#F58220]/10 text-[#F58220] text-xs font-bold rounded-full mb-3">
                                            {businessData.category}
                                        </span>
                                    )}

                                    {businessData.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                            {businessData.description}
                                        </p>
                                    )}

                                    {businessData.website && (
                                        <a
                                            href={businessData.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-[#F58220] hover:underline mb-4 block flex items-center gap-1"
                                        >
                                            <Globe className="h-3 w-3" /> Visit Website
                                        </a>
                                    )}

                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        {businessData.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-[#F58220]" />
                                                {businessData.phone}
                                            </div>
                                        )}
                                        {businessData.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-[#F58220]" />
                                                {businessData.email}
                                            </div>
                                        )}
                                        {(businessData.city || businessData.address) && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-[#F58220]" />
                                                {businessData.city && `${businessData.city}, `}{businessData.county || "Kenya"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-bold">5.0</span>
                                        </div>
                                        <span className="text-sm text-gray-500">•</span>
                                        <span className="text-sm text-gray-600">New Business</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
