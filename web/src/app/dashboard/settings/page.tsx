"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth"
import { apiClient, getImageUrl } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2, Upload, User as UserIcon } from "lucide-react"
import { useRef } from "react"
import Image from "next/image"

export default function SettingsPage() {
    const { user, updateUser } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profile_image_url || null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfileImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const data = new FormData()
            data.append('first_name', formData.first_name)
            data.append('last_name', formData.last_name)
            if (formData.email) data.append('email', formData.email)
            if (profileImage) {
                data.append('profile_image', profileImage)
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v3'}/auth/profile/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
                },
                body: data
            })

            if (!res.ok) throw new Error("Failed to update profile")

            const updatedUser = await res.json()
            updateUser(updatedUser)
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and notifications.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Profile Picture Upload */}
                        <div className="grid gap-2">
                            <Label>Profile Picture</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    onClick={handleImageClick}
                                    className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#F58220] cursor-pointer transition-colors overflow-hidden group"
                                >
                                    {profileImagePreview ? (
                                        <>
                                            <Image
                                                src={getImageUrl(profileImagePreview) || profileImagePreview}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="h-6 w-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <UserIcon className="h-8 w-8 text-gray-400 mb-1" />
                                            <Upload className="h-4 w-4 text-gray-400" />
                                        </div>
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
                                    <p className="text-sm font-medium">{profileImagePreview ? 'Click to change' : 'Upload profile picture'}</p>
                                    <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Phone Number</Label>
                            <Input disabled value={user?.phone || ''} className="bg-gray-50" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <Button
                            className="bg-[#F58220] hover:bg-[#D66D18] w-fit min-w-[120px]"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Configure how you want to be notified.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>SMS Notifications</Label>
                                <p className="text-sm text-gray-500">Receive critical alerts via SMS</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
