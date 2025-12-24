"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrustBadge } from "@/components/trust/TrustBadge"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, FileText, Phone } from "lucide-react"

const PENDING_REQUESTS = [
    {
        id: "v-1",
        business: "Kitisons Auto Spares",
        owner: "Sheila Muriithi",
        submitted_at: "2 hours ago",
        status: "pending",
        partnership: "FEM12345",
    },
    {
        id: "v-2",
        business: "Neema Catering",
        owner: "Peter Gichuru",
        submitted_at: "1 day ago",
        status: "pending",
        partnership: "FEM67890",
    }
]

export default function AdminVerificationsPage() {
    return (
        <div className="container py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1A1A1A]">Verification Management</h1>
                <p className="text-gray-500 mt-1">Review and approve church verification requests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-[#F58220]/5 border-[#F58220]/20">
                    <CardContent className="p-6">
                        <div className="text-2xl font-bold text-[#F58220]">12</div>
                        <div className="text-sm text-[#F58220]/70">Pending Requests</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-6">
                        <div className="text-2xl font-bold text-green-700">850</div>
                        <div className="text-sm text-green-600">Verified Businesses</div>
                    </CardContent>
                </Card>
                <Card className="bg-gray-50 border-gray-100">
                    <CardContent className="p-6">
                        <div className="text-2xl font-bold text-gray-700">92%</div>
                        <div className="text-sm text-gray-600">Approval Rate</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#F58220]" /> Awaiting Review
                </h2>

                {PENDING_REQUESTS.map((request) => (
                    <Card key={request.id} className="border-gray-100 hover:border-[#F58220]/30 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                        {request.business[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1A1A1A]">{request.business}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {request.partnership}</span>
                                            <span>•</span>
                                            <span>{request.owner}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Phone className="h-3.5 w-3.5" /> Call Reference
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2">
                                        <XCircle className="h-3.5 w-3.5" /> Reject
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-xs text-gray-400">Submitted {request.submitted_at}</div>
                                <TrustBadge type="new_member" showTooltip={false} className="opacity-60" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
