import { createContext, useState, useEffect } from 'react';
import { getMe } from './services/auth.api';

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Run once on mount — hydrate the user from the session cookie
    useEffect(() => {
        const hydrate = async () => {
            try {
                const data = await getMe()
                setUser(data?.user ?? null)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        hydrate()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading, error, setError }}>
            {children}
        </AuthContext.Provider>
    )
}
