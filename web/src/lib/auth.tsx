"use client"

import { useState, createContext, useContext, ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "./api-client"

interface AuthContextType {
    user: any | null
    loading: boolean
    login: (identifier: string, method?: 'phone' | 'email') => Promise<string | undefined>
    signup: (formData: any) => Promise<string | undefined>
    verifyOtp: (identifier: string, otp: string, rememberMe?: boolean) => Promise<any>
    logout: () => void
    updateUser: (userData: any) => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
            const rememberMe = localStorage.getItem("auth_remember_me") === "true"
            const loginDate = localStorage.getItem("auth_login_date")

            if (accessToken) {
                // If remember me is on, check if it's within 30 days
                if (rememberMe && loginDate) {
                    const daysSinceLogin = (new Date().getTime() - new Date(loginDate).getTime()) / (1000 * 60 * 60 * 24)
                    if (daysSinceLogin > 30) {
                        logout()
                        setLoading(false)
                        return
                    }
                }

                try {
                    // Fetch user profile to verify token and get fresh data
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v3"}/auth/profile/`, {
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    })
                    if (response.ok) {
                        const data = await response.json()
                        setUser(data.user) // Access nested user object
                    } else {
                        // Token invalid/expired
                        logout()
                    }
                } catch (error) {
                    console.error("Auth restoration failed:", error)
                }
            }
            setLoading(false)
        }
        checkAuth()
    }, [])

    const login = async (identifier: string, method: 'phone' | 'email' = 'phone') => {
        setLoading(true)
        try {
            const response = await apiClient.auth.login(identifier, method)
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to login")
            return data.identifier
        } finally {
            setLoading(false)
        }
    }

    const signup = async (formData: any) => {
        setLoading(true)
        try {
            const response = await apiClient.auth.signup(formData)
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to sign up")
            return data.identifier
        } finally {
            setLoading(false)
        }
    }

    const verifyOtp = async (identifier: string, otp: string, rememberMe: boolean = false) => {
        setLoading(true)
        try {
            const response = await apiClient.auth.verifyOtp(identifier, otp)
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Invalid OTP")

            // Store tokens and user
            const storage = rememberMe ? localStorage : sessionStorage
            storage.setItem("access_token", data.access)
            storage.setItem("refresh_token", data.refresh)

            // If remember me is set, also store a flag in localStorage for long-term tracking
            if (rememberMe) {
                localStorage.setItem("auth_remember_me", "true")
                localStorage.setItem("auth_login_date", new Date().toISOString())
            }

            const userData = {
                ...data.user,
                has_business_profile: data.user.has_business_profile || false,
                phone_verified: data.user.phone_verified || false
            }
            setUser(userData)
            return userData
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("auth_remember_me")
        localStorage.removeItem("auth_login_date")
        sessionStorage.removeItem("access_token")
        sessionStorage.removeItem("refresh_token")
        setUser(null)
        router.push('/')
    }

    const updateUser = (userData: any) => {
        setUser((prev: any) => ({ ...prev, ...userData }))
    }

    const refreshUser = async () => {
        const accessToken = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
        if (!accessToken) return

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v3"}/auth/profile/`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            })
            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error("User refresh failed:", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, verifyOtp, logout, updateUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within AuthProvider")
    return context
}
