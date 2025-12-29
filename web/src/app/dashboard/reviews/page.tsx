"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2, ShieldCheck, User, Star, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Review {
    id: number
    user_name: string
    rating: number
    review_text: string
    created_at: string
    is_verified: boolean
}

export default function ReviewsPage() {
    const { user } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Try to get business ID first
                const bizRes = await apiClient.businesses.myBusiness()
                if (bizRes.ok) {
                    const biz = await bizRes.json()
                    const revRes = await apiClient.reviews.list(`business_id=${biz.id}`)
                    if (revRes.ok) {
                        const data = await revRes.json()
                        setReviews(data.results || data)
                    }
                } else {
                    // If no business, fetch reviews authored by the user
                    // Using 'user=me' or filtering by current user ID if the API supports it
                    // Assuming apiClient.reviews.list supports filtering by user
                    if (user?.id) {
                        const revRes = await apiClient.reviews.list(`user_id=${user.id}`)
                        if (revRes.ok) {
                            const data = await revRes.json()
                            setReviews(data.results || data)
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load reviews:", error)
                toast.error("Failed to load reviews")
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchReviews()
    }, [user])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Reviews</h2>
                    <p className="text-muted-foreground">Manage reviews and ratings from community members.</p>
                </div>
                {!loading && reviews.length > 0 && (
                    <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
                        <Star className="h-5 w-5 fill-[#F58220] text-[#F58220]" />
                        <span className="text-lg font-extrabold text-[#F58220]">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                        </span>
                        <span className="text-sm text-[#F58220]/70 font-bold">Average Rating</span>
                    </div>
                )}
            </div>

            <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle>Recent Feedback</CardTitle>
                    <CardDescription>View what the community is saying about your business.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Loading reviews...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {reviews.map((review) => (
                                <div key={review.id} className="py-6 first:pt-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{review.user_name}</span>
                                                    {review.is_verified && (
                                                        <ShieldCheck className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-4 w-4",
                                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                                        "{review.review_text}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No reviews yet</h3>
                            <p className="max-w-xs mx-auto">
                                Reviews will appear here once customers start sharing their experiences with your business.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
