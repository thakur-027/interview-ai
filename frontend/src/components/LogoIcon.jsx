import React from 'react'

/**
 * The InterviewGen logo icon — chat bubble with a 4-point star.
 * Gradient: #6B7AFF (blue-violet) → #00D4FF (cyan), matching the brand logo.
 *
 * @param {number} size - width/height in px, default 28
 * @param {string} id   - unique gradient id suffix to avoid SVG id collisions
 */
const LogoIcon = ({ size = 28, id = 'logo' }) => {
    const gradId = `ig-grad-${id}`
    const shadowId = `ig-shadow-${id}`

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6B7AFF" />
                    <stop offset="100%" stopColor="#00D4FF" />
                </linearGradient>
                <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00D4FF" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Outer dark rounded-square container */}
            <rect width="40" height="40" rx="10" fill="#161824" />

            {/* Chat bubble shape */}
            <path
                d="M8 11C8 8.79 9.79 7 12 7H28C30.21 7 32 8.79 32 11V24C32 26.21 30.21 28 28 28H17L12 33V28H12C9.79 28 8 26.21 8 24V11Z"
                fill={`url(#${gradId})`}
                filter={`url(#${shadowId})`}
            />

            {/* 4-point star */}
            <path
                d="M22.5 16C22.5 16 22 18.5 20 20C22 20 24.5 20 24.5 20C24.5 20 22 20.5 20 22.5C20 22.5 20 20 18 20C18 20 20.5 20 20.5 18C20.5 18 20 20 22.5 16Z"
                fill="#0d0f1a"
            />
            {/* Cleaner 4-point star using a polygon approach */}
            <g transform="translate(20, 19.5)">
                <path
                    d="M0 -5.5 L1.1 -1.1 L5.5 0 L1.1 1.1 L0 5.5 L-1.1 1.1 L-5.5 0 L-1.1 -1.1 Z"
                    fill="#0d0f1a"
                />
            </g>
        </svg>
    )
}

export default LogoIcon
