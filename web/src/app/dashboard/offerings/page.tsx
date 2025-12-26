"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    Plus,
    Edit,
    Trash2,
    Package,
    DollarSign,
    Image as ImageIcon,
    Search,
    MoreVertical,
    Eye,
    EyeOff,
    Clock,
    AlertCircle
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Business Limits
const MAX_PRODUCTS = 5
const MAX_SERVICES = 5

interface Product {
    id: number
    name: string
    description: string
    price: number
    price_currency: string
    product_image?: string
    is_active: boolean
    in_stock: boolean
}

interface Service {
    id: number
    name: string
    description: string
    price_range: string
    duration?: string
    service_image?: string
    is_active: boolean
}

export default function ManageOfferingsPage() {
    const [activeTab, setActiveTab] = useState<"products" | "services">("products")
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const [products, setProducts] = useState<Product[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchBusinessData()
    }, [])

    const fetchBusinessData = async () => {
        try {
            const res = await apiClient.businesses.myBusiness()
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products || [])
                setServices(data.services || [])
            } else if (res.status === 404) {
                // Return empty arrays to stop loading state
                setProducts([])
                setServices([])
            } else {
                toast.error("Failed to load offerings")
            }
        } catch (error) {
            console.error("Error fetching offerings:", error)
            toast.error("An error occurred while connecting to the server.")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleProductStatus = async (id: number) => {
        const product = products.find(p => p.id === id)
        if (!product) return

        try {
            const res = await apiClient.products.save({ id, is_active: !product.is_active })
            if (res.ok) {
                setProducts(products.map(p =>
                    p.id === id ? { ...p, is_active: !p.is_active } : p
                ))
                toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'}`)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const toggleServiceStatus = async (id: number) => {
        const service = services.find(s => s.id === id)
        if (!service) return

        try {
            const res = await apiClient.services.save({ id, is_active: !service.is_active })
            if (res.ok) {
                setServices(services.map(s =>
                    s.id === id ? { ...s, is_active: !s.is_active } : s
                ))
                toast.success(`Service ${!service.is_active ? 'activated' : 'deactivated'}`)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const canAddProduct = products.length < MAX_PRODUCTS
    const canAddService = services.length < MAX_SERVICES
    const remainingProducts = MAX_PRODUCTS - products.length
    const remainingServices = MAX_SERVICES - services.length

    if (isLoading) {
        return (
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Loading your offerings...</p>
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">Manage Offerings</h1>
                    <p className="text-gray-500 mt-2">Add, edit, and organize your products & services</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            disabled={activeTab === "products" ? !canAddProduct : !canAddService}
                            className="h-12 px-6 text-base font-bold bg-[#F58220] hover:bg-[#D66D18] text-white rounded-xl shadow-lg transition-all hover:scale-[1.02] btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add {activeTab === "products" ? "Product" : "Service"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New {activeTab === "products" ? "Product" : "Service"}</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to add a new {activeTab === "products" ? "product" : "service"} to your catalog
                            </DialogDescription>
                        </DialogHeader>
                        <AddOfferingForm
                            type={activeTab}
                            onClose={() => setIsAddDialogOpen(false)}
                            onSuccess={fetchBusinessData}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Limit Warning Banner */}
            {((activeTab === "products" && remainingProducts <= 2 && remainingProducts > 0) ||
                (activeTab === "services" && remainingServices <= 2 && remainingServices > 0)) && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-orange-800">
                                        {activeTab === "products"
                                            ? `Only ${remainingProducts} product slot${remainingProducts === 1 ? '' : 's'} remaining`
                                            : `Only ${remainingServices} service slot${remainingServices === 1 ? '' : 's'} remaining`
                                        }
                                    </p>
                                    <p className="text-xs text-orange-700 mt-1">
                                        You can have up to {activeTab === "products" ? MAX_PRODUCTS : MAX_SERVICES} {activeTab} per business.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            {/* Max Limit Reached Banner */}
            {((activeTab === "products" && !canAddProduct) ||
                (activeTab === "services" && !canAddService)) && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-800">
                                        Maximum {activeTab} limit reached
                                    </p>
                                    <p className="text-xs text-red-700 mt-1">
                                        You've reached the maximum of {activeTab === "products" ? MAX_PRODUCTS : MAX_SERVICES} {activeTab}. Delete an existing one to add a new one.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("products")}
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === "products"
                        ? "bg-white text-[#F58220] shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    <Package className="inline h-4 w-4 mr-2" />
                    Products ({products.length})
                </button>
                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === "services"
                        ? "bg-white text-[#F58220] shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    <Clock className="inline h-4 w-4 mr-2" />
                    Services ({services.length})
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-gray-200 rounded-xl"
                />
            </div>

            {/* Products List */}
            {activeTab === "products" && (
                <div className="space-y-4">
                    {filteredProducts.length === 0 ? (
                        <EmptyState type="products" onAdd={() => setIsAddDialogOpen(true)} />
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onToggleStatus={toggleProductStatus}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Services List */}
            {activeTab === "services" && (
                <div className="space-y-4">
                    {filteredServices.length === 0 ? (
                        <EmptyState type="services" onAdd={() => setIsAddDialogOpen(true)} />
                    ) : (
                        filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onToggleStatus={toggleServiceStatus}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function ProductCard({ product, onToggleStatus }: { product: Product; onToggleStatus: (id: number) => void }) {
    return (
        <Card className="border-none shadow-lg hover:shadow-xl transition-all group">
            <CardContent className="p-6">
                <div className="flex items-start gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.product_image ? (
                            <Image src={product.product_image} alt={product.name} width={96} height={96} className="object-cover" />
                        ) : (
                            <ImageIcon className="h-10 w-10 text-gray-400" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-[#1A1A1A]">{product.name}</h3>
                                <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={product.is_active}
                                    onCheckedChange={() => onToggleStatus(product.id)}
                                />
                                <span className={`text-sm font-medium ${product.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-[#F58220]" />
                                <span className="text-lg font-bold text-[#1A1A1A]">
                                    {product.price_currency} {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${product.in_stock
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                                }`}>
                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ServiceCard({ service, onToggleStatus }: { service: Service; onToggleStatus: (id: number) => void }) {
    return (
        <Card className="border-none shadow-lg hover:shadow-xl transition-all group">
            <CardContent className="p-6">
                <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-[#F58220]/20 to-[#F58220]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-10 w-10 text-[#F58220]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-[#1A1A1A]">{service.name}</h3>
                                <p className="text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={service.is_active}
                                    onCheckedChange={() => onToggleStatus(service.id)}
                                />
                                <span className={`text-sm font-medium ${service.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                    {service.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-[#F58220]" />
                                <span className="text-lg font-bold text-[#1A1A1A]">
                                    {service.price_range}
                                </span>
                            </div>
                            {service.duration && (
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                    {service.duration}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ type, onAdd }: { type: string; onAdd: () => void }) {
    return (
        <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {type === "products" ? (
                        <Package className="h-8 w-8 text-gray-400" />
                    ) : (
                        <Clock className="h-8 w-8 text-gray-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No {type} yet</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first {type === "products" ? "product" : "service"}</p>
                <Button onClick={onAdd} className="bg-[#F58220] hover:bg-[#D66D18] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add {type === "products" ? "Product" : "Service"}
                </Button>
            </CardContent>
        </Card>
    )
}

function AddOfferingForm({ type, onClose, onSuccess }: { type: "products" | "services"; onClose: () => void; onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        price_currency: "KES",
        price_range: "",
        duration: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) {
            toast.error("Name is required")
            return
        }

        setIsLoading(true)
        try {
            const payload = type === "products" ? {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                price_currency: formData.price_currency,
                is_active: true,
                in_stock: true
            } : {
                name: formData.name,
                description: formData.description,
                price_range: formData.price_range,
                duration: formData.duration,
                is_active: true
            }

            const res = await (type === "products"
                ? apiClient.products.save(payload)
                : apiClient.services.save(payload))

            if (res.ok) {
                toast.success(`${type === "products" ? "Product" : "Service"} added successfully!`)
                onSuccess()
                onClose()
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || `Failed to add ${type}`)
            }
        } catch (error) {
            console.error("Failed to add offering:", error)
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                    placeholder={type === "products" ? "e.g. Holy Bible" : "e.g. Wedding Photography"}
                    className="h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                    placeholder="Describe your offering..."
                    className="min-h-24"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            {type === "products" ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                            type="number"
                            placeholder="2500"
                            className="h-12"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input
                            placeholder="KES"
                            className="h-12"
                            value={formData.price_currency}
                            onChange={(e) => setFormData({ ...formData, price_currency: e.target.value })}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Price Range</Label>
                        <Input
                            placeholder="KES 10,000 - 50,000"
                            className="h-12"
                            value={formData.price_range}
                            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                            placeholder="2 hours"
                            className="h-12"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-[#F58220] hover:bg-[#D66D18] text-white">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <span>Saving</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></div>
                            </div>
                        </div>
                    ) : "Add " + (type === "products" ? "Product" : "Service")}
                </Button>
            </div>
        </form>
    )
}
