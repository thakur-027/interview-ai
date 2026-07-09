import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import LogoIcon from './LogoIcon'
import './Navbar.scss'

const Logo = () => (
    <Link to="/" className="navbar__logo" aria-label="InterviewGen home">
        <span className="navbar__logo-icon" aria-hidden="true">
            <LogoIcon size={30} id="navbar" />
        </span>
        <span className="navbar__logo-text">
            Interview<span>Gen</span>
        </span>
    </Link>
)

const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const location = useLocation()
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [location.pathname])

    const isLanding = location.pathname === '/'
    const isApp = location.pathname === '/app' || location.pathname.startsWith('/interview')

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${mobileOpen ? 'navbar--open' : ''}`} role="navigation" aria-label="Main navigation">
            <div className="navbar__inner">
                <Logo />

                {/* Desktop nav */}
                <div className="navbar__links" role="list">
                    {!user && isLanding && (
                        <>
                            <a href="#features" className="navbar__link" role="listitem">Features</a>
                            <a href="#how-it-works" className="navbar__link" role="listitem">How it works</a>
                        </>
                    )}
                    {user && (
                        <Link to="/app" className={`navbar__link ${isApp ? 'navbar__link--active' : ''}`} role="listitem">
                            Dashboard
                        </Link>
                    )}
                </div>

                <div className="navbar__actions">
                    {user ? (
                        <>
                            <span className="navbar__user" aria-label={`Signed in as ${user.username}`}>
                                <span className="navbar__avatar" aria-hidden="true">
                                    {user.username?.[0]?.toUpperCase()}
                                </span>
                                <span className="navbar__username">{user.username}</span>
                            </span>
                            <button
                                className="button secondary-button navbar__cta"
                                onClick={handleLogout}
                                type="button"
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="button ghost-button">Sign in</Link>
                            <Link to="/register" className="button primary-button navbar__cta">
                                Get started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="navbar__hamburger"
                    onClick={() => setMobileOpen(o => !o)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                    type="button"
                >
                    <span /><span /><span />
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="navbar__mobile-drawer" role="menu">
                    {!user && isLanding && (
                        <>
                            <a href="#features" className="navbar__mobile-link" role="menuitem">Features</a>
                            <a href="#how-it-works" className="navbar__mobile-link" role="menuitem">How it works</a>
                        </>
                    )}
                    {user && (
                        <Link to="/app" className="navbar__mobile-link" role="menuitem">Dashboard</Link>
                    )}
                    <div className="navbar__mobile-actions">
                        {user ? (
                            <button className="button secondary-button" onClick={handleLogout} type="button">
                                Sign out
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="button secondary-button">Sign in</Link>
                                <Link to="/register" className="button primary-button">Get started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
