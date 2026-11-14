import React from 'react'

/**
 * The InterviewGen two-person mark.
 *
 * @param {number} size - width/height in px, default 28
 */
const LogoIcon = ({ size = 28 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
        >
            <rect width="40" height="40" rx="10" fill="#10B981" />
            <circle cx="13" cy="14" r="4.5" fill="#080808" />
            <path d="M6 29C6 23.8 8.8 20.5 13 20.5C17.2 20.5 20 23.8 20 29V32H6V29Z" fill="#080808" />
            <circle cx="27" cy="14" r="4.5" fill="#087F5B" />
            <path d="M20 29C20 23.8 22.8 20.5 27 20.5C31.2 20.5 34 23.8 34 29V32H20V29Z" fill="#087F5B" />
        </svg>
    )
}

export default LogoIcon
