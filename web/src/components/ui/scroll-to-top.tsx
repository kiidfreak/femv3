"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)

        return () => {
            window.removeEventListener("scroll", toggleVisibility)
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Button
                size="icon"
                onClick={scrollToTop}
                className={cn(
                    "rounded-full bg-[#F58220] hover:bg-[#D66D18] text-white shadow-lg transition-all duration-300 transform",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
                )}
            >
                <ArrowUp className="h-5 w-5" />
            </Button>
        </div>
    )
}
