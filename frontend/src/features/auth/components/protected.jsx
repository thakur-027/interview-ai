import React from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import '../auth.form.scss'

const ProtectedRoute = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <div className="auth-loading" aria-busy="true" aria-label="Loading">
                <div className="auth-loading__spinner" aria-hidden="true" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute
