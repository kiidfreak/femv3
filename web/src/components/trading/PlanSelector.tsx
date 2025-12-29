"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Zap, Target, TrendingUp, AlertTriangle } from "lucide-react"

interface Plan {
    id: number
    name: string
    description: string
    account_size: string
    profit_target: string
    max_drawdown: string
    max_daily_loss: string
    price: string
    currency: string
}

export function PlanSelector({ plans, onSelect }: { plans: Plan[], onSelect: (planId: number) => void }) {
    return (
        <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
                <Card key={plan.id} className="relative overflow-hidden border-2 hover:border-[#F58220] transition-all group flex flex-col h-full">
                    {plan.name.includes("Master") && (
                        <div className="absolute top-0 right-0 bg-[#F58220] text-white px-4 py-1.5 text-xs font-bold rounded-bl-xl z-10 animate-pulse">
                            MOST POPULAR
                        </div>
                    )}

                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 flex-1">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Starting Capital</div>
                            <div className="text-4xl font-black text-[#1A1A1A]">
                                ${Number(plan.account_size).toLocaleString()}
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {[
                                { label: 'Profit Target', value: `$${Number(plan.profit_target).toLocaleString()}`, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Max Drawdown', value: `$${Number(plan.max_drawdown).toLocaleString()}`, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
                                { label: 'Daily Loss Limit', value: `$${Number(plan.max_daily_loss).toLocaleString()}`, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                            ].map((item, i) => (
                                <li key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.bg}`}>
                                            <item.icon className={`h-4 w-4 ${item.color}`} />
                                        </div>
                                        <span className="font-semibold text-gray-600">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-[#1A1A1A]">{item.value}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-6 border-t border-gray-100 mt-auto">
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-black text-[#1A1A1A]">${plan.price}</span>
                                <span className="text-gray-400 font-bold">/one-time</span>
                            </div>

                            <Button
                                onClick={() => onSelect(plan.id)}
                                className="w-full h-14 rounded-2xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all group/btn"
                            >
                                Get Started <Zap className="ml-2 h-5 w-5 fill-[#F58220] text-[#F58220] group-hover:scale-125 transition-transform" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
