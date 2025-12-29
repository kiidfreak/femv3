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
    const [editingOffering, setEditingOffering] = useState<{ type: "products" | "services", data: any } | null>(null)

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
                setProducts([])
                setServices([])
            } else {
                toast.error("Failed to load offerings")
            }
        } catch (error) {
            console.error("Error fetching offerings:", error)
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
                setProducts(products.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p))
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
                setServices(services.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s))
                toast.success(`Service ${!service.is_active ? 'activated' : 'deactivated'}`)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleEdit = (type: "products" | "services", data: any) => {
        setEditingOffering({ type, data })
        setActiveTab(type)
        setIsAddDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsAddDialogOpen(false)
        setEditingOffering(null)
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
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
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
                            <DialogTitle>{editingOffering ? "Edit" : "Add New"} {activeTab === "products" ? "Product" : "Service"}</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to {editingOffering ? "update your" : "add a new"} {activeTab === "products" ? "product" : "service"}
                            </DialogDescription>
                        </DialogHeader>
                        <AddOfferingForm
                            type={activeTab}
                            initialData={editingOffering?.data}
                            onClose={handleCloseDialog}
                            onSuccess={fetchBusinessData}
                        />
                    </DialogContent>
                </Dialog>
            </div>

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
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === "products" ? "bg-white text-[#F58220] shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                >
                    <Package className="inline h-4 w-4 mr-2" />
                    Products ({products.length})
                </button>
                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === "services" ? "bg-white text-[#F58220] shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
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

            {/* List Content */}
            <div className="space-y-4">
                {activeTab === "products" ? (
                    filteredProducts.length === 0 ? <EmptyState type="products" onAdd={() => setIsAddDialogOpen(true)} /> :
                        filteredProducts.map(p => <ProductCard key={p.id} product={p} onToggleStatus={toggleProductStatus} onEdit={() => handleEdit("products", p)} />)
                ) : (
                    filteredServices.length === 0 ? <EmptyState type="services" onAdd={() => setIsAddDialogOpen(true)} /> :
                        filteredServices.map(s => <ServiceCard key={s.id} service={s} onToggleStatus={toggleServiceStatus} onEdit={() => handleEdit("services", s)} />)
                )}
            </div>
        </div>
    )
}

function ProductCard({ product, onToggleStatus, onEdit }: { product: Product; onToggleStatus: (id: number) => void; onEdit: () => void }) {
    return (
        <Card className="border-none shadow-lg hover:shadow-xl transition-all group overflow-hidden">
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
                            <div className="cursor-pointer" onClick={onEdit}>
                                <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#F58220] transition-colors">{product.name}</h3>
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
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onEdit} className="h-9 w-9 p-0 rounded-lg">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ServiceCard({ service, onToggleStatus, onEdit }: { service: Service; onToggleStatus: (id: number) => void; onEdit: () => void }) {
    return (
        <Card className="border-none shadow-lg hover:shadow-xl transition-all group overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-[#F58220]/20 to-[#F58220]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-10 w-10 text-[#F58220]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="cursor-pointer" onClick={onEdit}>
                                <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#F58220] transition-colors">{service.name}</h3>
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
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onEdit} className="h-9 w-9 p-0 rounded-lg">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function AddOfferingForm({ type, initialData, onClose, onSuccess }: { type: "products" | "services"; initialData?: any; onClose: () => void; onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price?.toString() || "",
        price_currency: initialData?.price_currency || "KES",
        price_range: initialData?.price_range || "",
        duration: initialData?.duration || ""
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
                id: initialData?.id,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                price_currency: formData.price_currency,
                is_active: initialData ? initialData.is_active : true,
                in_stock: initialData ? initialData.in_stock : true
            } : {
                id: initialData?.id,
                name: formData.name,
                description: formData.description,
                price_range: formData.price_range,
                duration: formData.duration,
                is_active: initialData ? initialData.is_active : true
            }

            const res = await (type === "products"
                ? apiClient.products.save(payload)
                : apiClient.services.save(payload))

            if (res.ok) {
                toast.success(`${type === "products" ? "Product" : "Service"} ${initialData ? 'updated' : 'added'} successfully!`)
                onSuccess()
                onClose()
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || `Failed to save ${type}`)
            }
        } catch (error) {
            console.error("Failed to save offering:", error)
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
                <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-[#F58220] hover:bg-[#D66D18] text-white font-bold">
                    {isLoading ? "Saving..." : (initialData ? "Update " : "Add ") + (type === "products" ? "Product" : "Service")}
                </Button>
            </div>
        </form>
    )
}

function EmptyState({ type, onAdd }: { type: "products" | "services"; onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                {type === "products" ? <Package className="h-8 w-8 text-gray-400" /> : <Clock className="h-8 w-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">No {type} yet</h3>
            <p className="text-gray-500 max-w-sm mt-2 mb-6">
                Get started by adding your first {type === "products" ? "product" : "service"}. You can add up to {type === "products" ? MAX_PRODUCTS : MAX_SERVICES} items.
            </p>
            <Button onClick={onAdd} className="bg-[#1A1A1A] hover:bg-black text-white font-bold h-11 px-6 rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add {type === "products" ? "Product" : "Service"}
            </Button>
        </div>
    )
}
