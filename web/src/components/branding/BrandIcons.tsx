"use client"

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export const ShipLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
    const sailRef = useRef<SVGPathElement>(null)
    const hullRef = useRef<SVGPathElement>(null)
    const waveRef = useRef<SVGPathElement>(null)

    useEffect(() => {
        if (sailRef.current && hullRef.current && waveRef.current) {
            gsap.to(sailRef.current, {
                duration: 2,
                attr: { d: "M20 10 L40 30 L20 35 Z" }, // Mild sway
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            })

            gsap.to(waveRef.current, {
                duration: 1.5,
                x: -5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            })
        }
    }, [])

    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Wave */}
            <path
                ref={waveRef}
                d="M2 50 Q16 45 32 50 T62 50"
                stroke="#F58220"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.4"
            />
            {/* Hull */}
            <path
                ref={hullRef}
                d="M10 35 L54 35 L46 50 L18 50 Z"
                fill="#F58220"
            />
            {/* Sail */}
            <path
                ref={sailRef}
                d="M20 10 L40 30 L20 30 Z"
                fill="#F58220"
                opacity="0.8"
            />
            {/* Mast */}
            <rect x="18" y="5" width="2" height="30" fill="#1A1A1A" />
        </svg>
    )
}

export const TrustShield = ({ className = "w-12 h-12" }: { className?: string }) => {
    const starRef = useRef<SVGPathElement>(null)

    useEffect(() => {
        if (starRef.current) {
            gsap.to(starRef.current, {
                scale: 1.2,
                duration: 1,
                repeat: -1,
                yoyo: true,
                transformOrigin: "center",
                ease: "power1.inOut"
            })
        }
    }, [])

    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M32 4 L56 12 V32 C56 46 46 58 32 62 C18 58 8 46 8 32 V12 L32 4Z"
                fill="#F58220"
                fillOpacity="0.1"
                stroke="#F58220"
                strokeWidth="2"
            />
            <path
                ref={starRef}
                d="M32 18 L36 29 H48 L38 36 L42 47 L32 40 L22 47 L26 36 L16 29 H28 L32 18Z"
                fill="#F58220"
            />
        </svg>
    )
}

export const ConnectionIcon = ({ className = "w-12 h-12" }: { className?: string }) => {
    const dot1Ref = useRef<SVGCircleElement>(null)
    const dot2Ref = useRef<SVGCircleElement>(null)
    const lineRef = useRef<SVGPathElement>(null)

    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1, yoyo: true })
        tl.to(dot1Ref.current, { duration: 1, attr: { r: 6 }, ease: "sine.inOut" })
            .to(dot2Ref.current, { duration: 1, attr: { r: 6 }, ease: "sine.inOut" }, "-=0.5")

        gsap.to(lineRef.current, {
            strokeDashoffset: 0,
            duration: 2,
            repeat: -1,
            ease: "none"
        })
    }, [])

    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle ref={dot1Ref} cx="16" cy="32" r="4" fill="#F58220" />
            <circle ref={dot2Ref} cx="48" cy="32" r="4" fill="#1A1A1A" />
            <path
                ref={lineRef}
                d="M16 32 C32 16 32 48 48 32"
                stroke="#F58220"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="100"
                strokeDashoffset="100"
            />
        </svg>
    )
}
