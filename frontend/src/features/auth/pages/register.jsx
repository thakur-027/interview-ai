import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import LogoIcon from '../../../components/LogoIcon.jsx'
import '../auth.form.scss'

const Register = () => {
    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)
        const result = await handleRegister({ username, email, password })
        setIsSubmitting(false)
        if (result.success) {
            navigate('/app')
        } else {
            setError(result.message)
        }
    }

    if (loading) {
        return (
            <div className="auth-loading" aria-busy="true">
                <div className="auth-loading__spinner" aria-hidden="true" />
            </div>
        )
    }

    return (
        <div className="auth-layout">
            {/* Brand panel */}
            <aside className="auth-brand" aria-label="InterviewGen brand">
                <div className="auth-brand__glow auth-brand__glow--1" aria-hidden="true" />
                <div className="auth-brand__glow auth-brand__glow--2" aria-hidden="true" />
                <div className="auth-brand__content">
                    <Link to="/" className="auth-brand__logo" aria-label="InterviewGen home">
                        <span className="auth-brand__logo-icon" aria-hidden="true">
                            <LogoIcon size={34} id="register-brand" />
                        </span>
                        <span className="auth-brand__logo-name">Interview<span>Gen</span></span>
                    </Link>

                    <div className="auth-brand__main">
                        <h1 className="auth-brand__headline">
                            Your next offer<br />starts here.
                        </h1>
                        <p className="auth-brand__sub">
                            Join community of candidates who use InterviewGen to walk into interviews prepared and confident.
                        </p>

                        <ul className="auth-brand__bullets" aria-label="Key features">
                            {[
                                'AI-powered match score in seconds',
                                'Role-specific interview questions',
                                'Personalized skill gap analysis',
                                'ATS-optimized resume download',
                            ].map((item) => (
                                <li key={item}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                        <path d="M2.5 7l3 3 6-6" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </aside>

            {/* Form panel */}
            <main className="auth-form-panel" aria-label="Create account">
                <nav className="auth-form-panel__nav" aria-label="Back to home">
                    <Link to="/" className="auth-back-link">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to home
                    </Link>
                </nav>

                <div className="auth-form-panel__inner">
                    <header className="auth-form-panel__header">
                        <h2>Create your account</h2>
                        <p>Free to start. No credit card required.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        {error && (
                            <div className="form-error" role="alert" aria-live="assertive">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="auth-field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="button primary-button auth-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="auth-submit__spinner" aria-hidden="true" />
                                    Creating account…
                                </>
                            ) : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </main>
        </div>
    )
}

export default Register
