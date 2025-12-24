import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type BadgeType = "church_verified" | "community_recommended" | "trusted_provider" | "new_member"

interface TrustBadgeProps {
    type: BadgeType
    className?: string
    showTooltip?: boolean
}

const BADGE_CONFIG = {
    church_verified: {
        label: "Church Verified",
        icon: ShieldCheck,
        color: "bg-[#F58220] text-white",
        description: "Verified by FEM Family Church leadership as a member in good standing."
    },
    community_recommended: {
        label: "Community Recommended",
        icon: ShieldCheck,
        color: "bg-[#1A1A1A] text-white",
        description: "Highly rated by at least 10 verified church members."
    },
    trusted_provider: {
        label: "Trusted Provider",
        icon: ShieldCheck,
        color: "bg-green-600 text-white",
        description: "Proven track record with 50+ successful community interactions."
    },
    new_member: {
        label: "New Member",
        icon: ShieldCheck,
        color: "bg-gray-100 text-gray-600",
        description: "Recently joined the network (less than 30 days)."
    }
}

export function TrustBadge({ type, className, showTooltip = true }: TrustBadgeProps) {
    const config = BADGE_CONFIG[type]
    const Icon = config.icon

    const badge = (
        <Badge className={cn("gap-1.5 px-3 py-1 font-bold border-none shadow-sm", config.color, className)}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </Badge>
    )

    if (!showTooltip) return badge

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1A1A] text-white border-none p-3 max-w-xs">
                    <p className="font-bold mb-1">{config.label}</p>
                    <p className="text-xs text-gray-300">{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
