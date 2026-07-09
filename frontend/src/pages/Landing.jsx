import React from 'react'
import { Link } from 'react-router'
import Navbar from '../components/Navbar'
import './Landing.scss'

const features = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="currentColor" strokeWidth="1.8" />
            </svg>
        ),
        title: 'Match Score',
        desc: 'Get a precise 0–100% compatibility score between your resume and the job description so you know exactly where you stand.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 7L4 12l5 5M15 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Technical Questions',
        desc: 'Receive role-specific technical questions with the interviewer\'s intent and a detailed guide on how to answer each one.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 7.75C5 6.78 5.78 6 6.75 6h10.5C18.22 6 19 6.78 19 7.75v6.5C19 15.22 18.22 16 17.25 16H9l-4 3V7.75z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Behavioral Questions',
        desc: 'Prepare for culture-fit and situational questions tailored to the company\'s values and your background.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Skill Gap Analysis',
        desc: 'Identify exactly which skills you\'re missing and how critical each gap is — so you can focus your prep where it matters.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12L19 5l-5 14-3-6-6-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Day-by-Day Roadmap',
        desc: 'Get a structured preparation plan with daily focus areas and tasks so you walk into the interview ready.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 3.75h7.25L19.25 8.75V20.25H7V3.75z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M14.25 3.75v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9.5 12.5h5M9.5 15.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
        title: 'AI-Tailored Resume PDF',
        desc: 'Generate a polished, ATS-optimized resume tailored to each job with a single click.',
    },
]

const steps = [
    {
        num: '01',
        title: 'Upload your resume',
        desc: 'Drop in your PDF or DOCX. InterviewGen reads every line and understands your experience, skills, and career story.',
    },
    {
        num: '02',
        title: 'Paste the job description',
        desc: 'Add the role you\'re targeting. Optionally describe your goals and unique context to sharpen the analysis.',
    },
    {
        num: '03',
        title: 'Get your report',
        desc: 'In seconds, Gemini AI generates a complete interview brief — questions, gaps, score, and a prep roadmap.',
    },
    {
        num: '04',
        title: 'Walk in confident',
        desc: 'Use your personalized plan to prepare, download your tailored resume, and show up ready for every question.',
    },
]

const Landing = () => {
    return (
        <div className="landing">
            <Navbar />

            {/* ── Hero ── */}
            <section className="landing__hero" aria-label="Hero">
                <div className="landing__glow landing__glow--1" aria-hidden="true" />
                <div className="landing__glow landing__glow--2" aria-hidden="true" />
                <div className="landing__grid" aria-hidden="true" />

                <div className="landing__hero-inner">
                    <div className="landing__badge" aria-label="Powered by Gemini AI">
                        <span className="landing__badge-dot" aria-hidden="true" />
                        Powered by Gemini AI
                    </div>

                    <h1 className="landing__headline">
                        Walk into every interview
                        <span className="landing__headline-accent"> fully prepared.</span>
                    </h1>

                    <p className="landing__subline">
                        Upload your resume, paste a job description, and get a complete
                        AI-powered interview report — match score, skill gaps, tailored
                        questions, and a day-by-day prep plan.
                    </p>

                    <div className="landing__hero-actions">
                        <Link to="/register" className="button primary-button landing__hero-cta">
                            Generate your report
                            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="16" height="16">
                                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <Link to="/login" className="button secondary-button">
                            Sign in
                        </Link>
                    </div>

                    <p className="landing__hero-note">Free to start. No credit card required.</p>
                </div>

                {/* Hero visual — mock report card */}
                <div className="landing__hero-card" aria-hidden="true">
                    <div className="hero-card">
                        <div className="hero-card__head">
                            <div className="hero-card__title">Interview Report</div>
                            <div className="hero-card__badge">Ready</div>
                        </div>
                        <div className="hero-card__score-row">
                            <div className="hero-card__score-ring">
                                <svg viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="7" />
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="url(#score-grad)" strokeWidth="7"
                                        strokeLinecap="round"
                                        strokeDasharray="201"
                                        strokeDashoffset="50"
                                        transform="rotate(-90 40 40)"
                                    />
                                    <defs>
                                        <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#4f46e5" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="hero-card__score-label">
                                    <strong>75</strong><span>%</span>
                                </div>
                            </div>
                            <div className="hero-card__meta">
                                <div className="hero-card__meta-item">
                                    <span className="hero-card__meta-dot hero-card__meta-dot--green" />
                                    8 technical questions
                                </div>
                                <div className="hero-card__meta-item">
                                    <span className="hero-card__meta-dot hero-card__meta-dot--purple" />
                                    6 behavioral questions
                                </div>
                                <div className="hero-card__meta-item">
                                    <span className="hero-card__meta-dot hero-card__meta-dot--amber" />
                                    3 skill gaps found
                                </div>
                                <div className="hero-card__meta-item">
                                    <span className="hero-card__meta-dot hero-card__meta-dot--blue" />
                                    7-day roadmap
                                </div>
                            </div>
                        </div>
                        <div className="hero-card__tags">
                            <span className="hero-card__tag hero-card__tag--high">React</span>
                            <span className="hero-card__tag hero-card__tag--medium">System Design</span>
                            <span className="hero-card__tag hero-card__tag--low">TypeScript</span>
                        </div>
                        <div className="hero-card__footer">
                            <div className="hero-card__pulse" />
                            <span>Generating questions…</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="landing__section landing__features" id="features" aria-label="Features">
                <div className="landing__section-inner">
                    <div className="landing__section-label">What you get</div>
                    <h2 className="landing__section-title">
                        Everything you need to<br />ace the interview
                    </h2>
                    <p className="landing__section-sub">
                        One report. Six tools. All driven by a single upload.
                    </p>

                    <div className="features-grid" role="list">
                        {features.map((f) => (
                            <article key={f.title} className="feature-card" role="listitem">
                                <div className="feature-card__icon" aria-hidden="true">{f.icon}</div>
                                <h3 className="feature-card__title">{f.title}</h3>
                                <p className="feature-card__desc">{f.desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="landing__section landing__how" id="how-it-works" aria-label="How it works">
                <div className="landing__section-inner">
                    <div className="landing__section-label">The process</div>
                    <h2 className="landing__section-title">
                        From upload to interview-ready<br />in under a minute
                    </h2>

                    <div className="steps" role="list">
                        {steps.map((s, i) => (
                            <div key={s.num} className="step" role="listitem">
                                <div className="step__num" aria-hidden="true">{s.num}</div>
                                {i < steps.length - 1 && (
                                    <div className="step__connector" aria-hidden="true" />
                                )}
                                <div className="step__body">
                                    <h3 className="step__title">{s.title}</h3>
                                    <p className="step__desc">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="landing__section landing__cta-section" aria-label="Call to action">
                <div className="landing__glow landing__glow--3" aria-hidden="true" />
                <div className="landing__section-inner landing__cta-inner">
                    <h2 className="landing__cta-title">
                        Your next interview starts here.
                    </h2>
                    <p className="landing__cta-sub">
                        Stop guessing what they'll ask. Let AI tell you.
                    </p>
                    <Link to="/register" className="button primary-button landing__cta-btn">
                        Generate your free report
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="16" height="16">
                            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing__footer" role="contentinfo">
                <div className="landing__footer-inner">
                    <div className="landing__footer-brand">
                        <span className="landing__logo-text">
                            Interview<span>Gen</span>
                        </span>
                        <p>AI-powered interview preparation.</p>
                    </div>
                    <nav className="landing__footer-links" aria-label="Footer navigation">
                        <Link to="/login">Sign in</Link>
                        <Link to="/register">Get started</Link>
                    </nav>
                    <p className="landing__footer-copy">
                        © {new Date().getFullYear()} InterviewGen. Built with Gemini AI.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
