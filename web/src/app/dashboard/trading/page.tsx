"use client"

import { useEffect, useState, Suspense } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth"
import { PlanSelector } from "@/components/trading/PlanSelector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Activity,
    BarChart3,
    History,
    Wallet,
    RefreshCcw,
    Loader2,
    ArrowLeft,
    ChevronRight,
    LineChart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

export default function TradingDashboard() {
    const { user } = useAuth()
    const [plans, setPlans] = useState([])
    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState<any>(null)
    const [trades, setTrades] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [plansRes, accountsRes] = await Promise.all([
                apiClient.trading.plans.list(),
                apiClient.trading.accounts.list()
            ])

            if (plansRes.ok) setPlans(await plansRes.json())

            if (accountsRes.ok) {
                const accs = await accountsRes.json()
                setAccounts(accs)
                if (accs.length > 0) {
                    setSelectedAccount(accs[0])
                    fetchTrades(accs[0].id)
                }
            }
        } catch (error) {
            console.error("Failed to fetch trading data:", error)
            toast.error("Failed to load trading data")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTrades = async (accountId: string) => {
        const res = await apiClient.trading.accounts.getTrades(accountId)
        if (res.ok) setTrades(await res.json())
    }

    const handleSelectPlan = async (planId: number) => {
        try {
            const res = await apiClient.trading.accounts.create(planId)
            if (res.ok) {
                toast.success("Account created successfully!")
                fetchData()
            } else {
                toast.error("Failed to create account")
            }
        } catch (error) {
            toast.error("Error creating account")
        }
    }

    const handleSync = async () => {
        if (!selectedAccount) return
        setIsSyncing(true)
        try {
            const res = await apiClient.trading.accounts.sync(selectedAccount.id)
            if (res.ok) {
                toast.success("Sync successful!")
                fetchData()
            }
        } catch (error) {
            toast.error("Sync failed")
        } finally {
            setIsSyncing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-[#F58220] animate-spin" />
                <p className="text-gray-500 font-medium">Connecting to Tradeovate Terminal...</p>
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/dashboard" className="text-gray-400 hover:text-[#F58220] transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Trader Trinity</h1>
                    </div>
                    <p className="text-gray-500">Prop Firm Evaluation & Trade Analytics</p>
                </div>

                {accounts.length > 0 && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="h-12 rounded-xl border-gray-200 font-bold hover:border-[#F58220] hover:text-[#F58220]"
                        >
                            <RefreshCcw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
                            Sync Terminal
                        </Button>
                        <Button className="h-12 rounded-xl bg-[#1A1A1A] hover:bg-black font-bold">
                            Open Tradeovate
                        </Button>
                    </div>
                )}
            </div>

            {accounts.length === 0 ? (
                <div className="space-y-12">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Choose Your Evaluation Plan</h2>
                        <p className="text-lg text-gray-500">
                            Prove your trading skills on our evaluation accounts. Pass the targets and get funded with up to $100,000 in trading capital.
                        </p>
                    </div>
                    <PlanSelector plans={plans} onSelect={handleSelectPlan} />
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Stats Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Account Selector Table (Small) */}
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                            {accounts.map((acc: any) => (
                                <button
                                    key={acc.id}
                                    onClick={() => setSelectedAccount(acc)}
                                    className={cn(
                                        "px-6 py-4 rounded-2xl border-2 transition-all shrink-0 text-left min-w-[200px]",
                                        selectedAccount?.id === acc.id
                                            ? "border-[#F58220] bg-orange-50/50 shadow-lg shadow-orange-100"
                                            : "border-gray-100 hover:border-gray-200 bg-white"
                                    )}
                                >
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{acc.plan_name}</div>
                                    <div className="text-lg font-black text-[#1A1A1A]">${Number(acc.balance).toLocaleString()}</div>
                                    <Badge className={cn(
                                        "mt-2 capitalize font-bold",
                                        acc.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                    )}>
                                        {acc.status}
                                    </Badge>
                                </button>
                            ))}
                        </div>

                        {/* Performance Cards */}
                        <div className="grid sm:grid-cols-3 gap-6">
                            <Card className="border-none shadow-lg bg-white overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#F58220]">
                                            <Wallet className="h-5 w-5" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Equity</div>
                                            <div className="text-xs font-bold text-green-500">+2.4%</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-[#1A1A1A]">${Number(selectedAccount?.equity).toLocaleString()}</div>
                                    <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Total Balance</div>
                                </CardContent>
                                <div className="h-1 w-full bg-gray-100 absolute bottom-0 left-0">
                                    <div className="h-full bg-[#F58220] transition-all duration-1000" style={{ width: '65%' }}></div>
                                </div>
                            </Card>

                            <Card className="border-none shadow-lg bg-white overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Daily Drawdown</div>
                                            <div className="text-xs font-bold text-red-500">-0.5%</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-[#1A1A1A]">${Number(selectedAccount?.current_drawdown).toLocaleString()}</div>
                                    <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Max: $2,500</div>
                                </CardContent>
                                <div className="h-1 w-full bg-gray-100 absolute bottom-0 left-0">
                                    <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: '12%' }}></div>
                                </div>
                            </Card>

                            <Card className="border-none shadow-lg bg-white overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Trades</div>
                                            <div className="text-xs font-bold text-purple-500">64.5% WR</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-[#1A1A1A]">{selectedAccount?.total_trades}</div>
                                    <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Total Executed</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Trades Table */}
                        <Card className="border-none shadow-lg overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-white p-6">
                                <div>
                                    <CardTitle className="text-lg font-black">Trade Records</CardTitle>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Live from Tradeovate Server</p>
                                </div>
                                <History className="h-5 w-5 text-gray-300" />
                            </CardHeader>
                            <CardContent className="p-0">
                                {trades.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <th className="px-6 py-4">Symbol</th>
                                                    <th className="px-6 py-4">Type</th>
                                                    <th className="px-6 py-4">Entry</th>
                                                    <th className="px-6 py-4">Exit</th>
                                                    <th className="px-6 py-4">Quantity</th>
                                                    <th className="px-6 py-4 text-right pr-8">P&L</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 bg-white">
                                                {trades.map((trade: any) => (
                                                    <tr key={trade.id} className="hover:bg-gray-50/80 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                                    {trade.symbol.substring(0, 2)}
                                                                </div>
                                                                <span className="font-bold text-[#1A1A1A]">{trade.symbol}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={cn(
                                                                "h-6 px-2 text-[10px] font-black uppercase",
                                                                trade.side === 'buy' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                            )}>
                                                                {trade.side}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-600">{trade.entry_price}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-600">{trade.exit_price || '-'}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-600">{trade.quantity}</td>
                                                        <td className={cn(
                                                            "px-6 py-4 text-sm font-black text-right pr-8",
                                                            Number(trade.pnl) >= 0 ? "text-green-600" : "text-red-600"
                                                        )}>
                                                            {Number(trade.pnl) >= 0 ? '+' : ''}${Number(trade.pnl).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <History className="h-12 w-12 text-gray-100 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold">No trades recorded yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Rules Widget */}
                        <Card className="border-none shadow-xl bg-[#1A1A1A] text-white">
                            <CardHeader>
                                <CardTitle className="text-xl font-black">Evaluation Rules</CardTitle>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Consistency & Discipline</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    { label: 'Profit Target', progress: 45, current: '$2,250', target: '$5,000', color: 'bg-[#F58220]' },
                                    { label: 'Daily Loss Limit', progress: 12, current: '$120', target: '$1,000', color: 'bg-red-500' },
                                    { label: 'Max Drawdown', progress: 5, current: '$100', target: '$2,000', color: 'bg-orange-500' },
                                    { label: 'Trading Days', progress: 60, current: '3 days', target: '5 days', color: 'bg-blue-500' },
                                ].map((rule, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-white/60">{rule.label}</span>
                                            <span>{rule.current} <span className="text-white/30">/ {rule.target}</span></span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-1000", rule.color)}
                                                style={{ width: `${rule.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Integration Help */}
                        <Card className="border-none shadow-lg bg-orange-50 border-orange-100 border">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black text-orange-900 mb-2">Connect Terminal</h3>
                                <p className="text-sm text-orange-700/80 mb-4 font-medium italic">
                                    "Success in trading comes from a disciplined mind and a heart anchored in patience."
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 rounded-full bg-orange-200 flex items-center justify-center shrink-0 text-orange-800 text-[10px] font-black">1</div>
                                        <p className="text-xs text-orange-800 font-bold">Copy your API Credentials from Account Settings.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 rounded-full bg-orange-200 flex items-center justify-center shrink-0 text-orange-800 text-[10px] font-black">2</div>
                                        <p className="text-xs text-orange-800 font-bold">Paste in the Tradeovate Desktop app under 'External API'.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
