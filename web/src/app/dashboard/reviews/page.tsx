"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MessageSquare } from "lucide-react"

export default function ReviewsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Reviews</h2>
                <p className="text-muted-foreground">Manage reviews and ratings from community members.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                    <CardDescription>View and respond to customer feedback.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Placeholder content until backend endpoint is integrated */}
                    <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No reviews received yet.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
