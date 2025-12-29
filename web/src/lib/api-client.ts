/**
 * Faith Connect v3 - Consolidated API Client
 * Targets the new domain-driven structure (32 endpoints approx)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v3"

const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token')) : null
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
}

export const getImageUrl = (path?: string) => {
    if (!path) return null;

    // Handle cases where the path might be like "/media/https%3A/..." or "media/https%3A/..."
    const decoded = decodeURIComponent(path);
    const httpIndex = decoded.indexOf('http');

    if (httpIndex !== -1) {
        const potentialUrl = decoded.substring(httpIndex);
        // If it's an external absolute URL (S3, etc.), use it directly
        if (potentialUrl.includes('://') && !potentialUrl.includes('localhost') && !potentialUrl.includes('127.0.0.1')) {
            return potentialUrl;
        }
    }

    if (path.startsWith('data:')) {
        return path;
    }

    // If it's already a full local URL, return it
    if (path.startsWith('http')) {
        return path;
    }

    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v3").replace('/api/v3', '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const apiClient = {
    // Generic helper
    get: async (endpoint: string) => {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    // Users
    users: {
        getRecentMembers: () => fetch(`${API_BASE_URL}/users/recent_members/`, { headers: { 'Content-Type': 'application/json' } }),
    },

    // 1. Auth (Consolidated)
    auth: {
        login: (identifier: string, method: 'phone' | 'email' = 'phone') => fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: identifier, method })
        }),
        signup: (data: any) => fetch(`${API_BASE_URL}/auth/signup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
        verifyOtp: (identifier: string, otp: string) => fetch(`${API_BASE_URL}/auth/verify-otp/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, otp })
        }),
        resendOtp: (identifier: string, method: string) => fetch(`${API_BASE_URL}/auth/resend-otp/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, method })
        }),
        logout: () => fetch(`${API_BASE_URL}/auth/logout/`, {
            method: 'POST',
            headers: getHeaders()
        }),
        updateProfile: (data: any) => fetch(`${API_BASE_URL}/auth/profile/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }),
    },

    // 2. Businesses (Unified PATCH/POST)
    // 2. Businesses (Unified PATCH/POST)
    businesses: {
        list: (params: string) => fetch(`${API_BASE_URL}/businesses?${params}`, { headers: getHeaders() }),
        get: (id: string) => fetch(`${API_BASE_URL}/businesses/${id}`, { headers: getHeaders() }),
        save: (data: any) => fetch(`${API_BASE_URL}/businesses/${data.id ? `${data.id}/` : ''}`, {
            method: data.id ? 'PATCH' : 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }),
        getStats: () => fetch(`${API_BASE_URL}/businesses/stats/`, { headers: getHeaders() }),
        incrementView: (id: string) => fetch(`${API_BASE_URL}/businesses/${id}/increment_view/`, {
            method: 'POST',
            headers: getHeaders()
        }),
        myBusiness: () => fetch(`${API_BASE_URL}/businesses/my_business/`, { headers: getHeaders() }),
        update: (id: string, data: any) => fetch(`${API_BASE_URL}/businesses/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }),
        getPublicStats: () => fetch(`${API_BASE_URL}/businesses/public_stats/`, { headers: { 'Content-Type': 'application/json' } }),
    },

    // 3. Offerings (Products & Services)
    products: {
        list: (params?: string) => fetch(`${API_BASE_URL}/products/${params ? `?${params}` : ''}`, { headers: getHeaders() }),
        save: (data: any) => {
            const isFormData = data instanceof FormData;
            const headers = getHeaders();
            if (isFormData) delete headers['Content-Type'];
            const id = isFormData ? data.get('id') : data.id;

            return fetch(`${API_BASE_URL}/products/${id ? `${id}/` : ''}`, {
                method: id ? 'PATCH' : 'POST',
                headers,
                body: isFormData ? data : JSON.stringify(data)
            })
        },
        delete: (id: number) => fetch(`${API_BASE_URL}/products/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        }),
    },
    services: {
        list: (params?: string) => fetch(`${API_BASE_URL}/services/${params ? `?${params}` : ''}`, { headers: getHeaders() }),
        save: (data: any) => {
            const isFormData = data instanceof FormData;
            const headers = getHeaders();
            if (isFormData) delete headers['Content-Type'];
            const id = isFormData ? data.get('id') : data.id;

            return fetch(`${API_BASE_URL}/services/${id ? `${id}/` : ''}`, {
                method: id ? 'PATCH' : 'POST',
                headers,
                body: isFormData ? data : JSON.stringify(data)
            })
        },
        delete: (id: number) => fetch(`${API_BASE_URL}/services/${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        }),
    },

    // 5. Reviews
    reviews: {
        list: (params?: string) => fetch(`${API_BASE_URL}/reviews/${params ? `?${params}` : ''}`, { headers: getHeaders() }),
        save: (data: any) => fetch(`${API_BASE_URL}/reviews/${data.id ? `${data.id}/` : ''}`, {
            method: data.id ? 'PATCH' : 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }),
    },

    // 6. Media (Token-Based)
    media: {
        getUploadToken: (file: File) => fetch(`${API_BASE_URL}/media/upload-token`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                filename: file.name,
                content_type: file.type,
                size_bytes: file.size
            })
        }),
        attach: (mediaId: string, entityType: string, entityId: string, type: string) =>
            fetch(`${API_BASE_URL}/media/attach`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    media_id: mediaId,
                    entity_type: entityType,
                    entity_id: entityId,
                    media_type: type
                })
            }),
    },

    // 5. Categories
    categories: {
        list: () => fetch(`${API_BASE_URL}/categories/`, { headers: getHeaders() }),
    },

    // 7. Favorites
    favorites: {
        list: (params?: string) => fetch(`${API_BASE_URL}/favorites/${params ? `?${params}` : ''}`, { headers: getHeaders() }),
        toggle: (data: { business?: string, product?: number, service?: number }) => fetch(`${API_BASE_URL}/favorites/toggle/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }),
    }
}
