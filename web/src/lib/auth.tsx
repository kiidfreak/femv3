"use client"

import { useState, createContext, useContext, ReactNode } from "react"
import { apiClient } from "./api-client"

interface AuthContextType {
    user: any | null
    isLoading: boolean
    login: (identifier: string, method?: 'phone' | 'email') => Promise<string | undefined>
    signup: (formData: any) => Promise<string | undefined>
    verifyOtp: (identifier: string, otp: string) => Promise<any>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const login = async (identifier: string, method: 'phone' | 'email' = 'phone') => {
        setIsLoading(true)
        try {
            const response = await apiClient.auth.login(identifier, method)
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to login")
            return data.identifier
        } finally {
            setIsLoading(false)
        }
    }

    const signup = async (formData: any) => {
        setIsLoading(true)
        try {
            const response = await apiClient.auth.signup(formData)
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to sign up")
            return data.identifier
        } finally {
            setIsLoading(false)
        }
    }

    const verifyOtp = async (identifier: string, otp: string) => {
        setIsLoading(true)
        try {
            const response = await apiClient.auth.verifyOtp(identifier, otp)
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Invalid OTP")

            // Store tokens and user
            localStorage.setItem("access_token", data.access)
            localStorage.setItem("refresh_token", data.refresh)
            const userData = {
                ...data.user,
                has_business_profile: data.user.has_business_profile || false,
                phone_verified: data.user.phone_verified || false
            }
            setUser(userData)
            return userData
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within AuthProvider")
    return context
}
