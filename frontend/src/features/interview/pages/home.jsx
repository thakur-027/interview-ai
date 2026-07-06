import React from 'react'
import '../style/home.scss'

const Home = () => {
    return (
        <main className="home">
            <div className="home__ambient home__ambient--one" aria-hidden="true" />
            <div className="home__ambient home__ambient--two" aria-hidden="true" />
            <div className="home__ambient home__ambient--grid" aria-hidden="true" />

            <section className="home__shell">
                <header className="home__topbar">
                    <div className="brand">
                        <h1>
                            Interview<span>Gen</span>
                        </h1>
                        <div className="brand__meta">
                            <span className="dot" aria-hidden="true" />
                            <span>Ready for analysis</span>
                            <span className="version">v1.0.4</span>
                        </div>
                    </div>

                    <div className="topbar__insights" aria-label="System insights">
                        <article>
                            <p>Analysis Model</p>
                            <strong>Advanced Heuristics Engine</strong>
                        </article>
                        <article>
                            <p>Security</p>
                            <strong>TLS 1.3 Encryption</strong>
                        </article>
                    </div>
                </header>

                <section className="home__workspace" aria-label="Candidate input form">
                    <article className="panel panel--description">
                        <div className="panel__label-row">
                            <span className="panel__icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M7 3.75h7.25L19.25 8.75V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                                    <path d="M14.25 3.75V8.75H19.25" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                                    <path d="M9.5 12.25H16.5M9.5 15.75H16.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                                </svg>
                            </span>
                            <label htmlFor="jobDescription">Job Description</label>
                            <p className="panel__meta">Auto-saving...</p>
                        </div>

                        <textarea
                            name="jobDescription"
                            id="jobDescription"
                            placeholder="Paste the target job description here. Include key requirements and core responsibilities for a comprehensive report."
                        />
                        <div className="panel__footer">
                            <p className="panel__hint">0 characters</p>
                            <button type="button">Clear</button>
                        </div>
                    </article>

                    <div className="home__sidebar">
                        <article className="panel panel--upload">
                            <div className="panel__label-row">
                                <span className="panel__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M12 3.75V15.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                                        <path d="M8.5 7.75L12 4.25L15.5 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M5.75 13.75C4.51 13.75 3.5 14.76 3.5 16V17.25C3.5 18.87 4.88 20.25 6.5 20.25H17.5C19.12 20.25 20.5 18.87 20.5 17.25V16C20.5 14.76 19.49 13.75 18.25 13.75H17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                                    </svg>
                                </span>
                                <div>
                                    <label htmlFor="resume">Resume</label>
                                </div>
                                <span className="pill">Mandatory</span>
                            </div>

                            <label className="dropzone" htmlFor="resume">
                                <span className="dropzone__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M9.25 18.25H7.5C5.15 18.25 3.25 16.35 3.25 14C3.25 11.9 4.78 10.16 6.79 9.82C7.42 6.96 9.97 4.75 13 4.75C16.19 4.75 18.86 7.2 19.2 10.3C20.97 10.71 22.25 12.25 22.25 14.1C22.25 16.28 20.47 18.06 18.29 18.06H15.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 11.25V19.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                                        <path d="M8.75 14.25L12 11L15.25 14.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                                <strong>Upload candidate profile</strong>
                                <small>PDF, DOCX up to 10MB</small>
                                <span className="dropzone__button">Select file</span>
                            </label>
                            <input hidden type="file" id="resume" accept=".pdf,.doc,.docx" />
                        </article>

                        <article className="panel panel--self-description">
                            <div className="panel__label-row">
                                <span className="panel__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M15.5 10.25C15.5 12.39 13.76 14.13 11.62 14.13C9.48 14.13 7.74 12.39 7.74 10.25C7.74 8.11 9.48 6.37 11.62 6.37C13.76 6.37 15.5 8.11 15.5 10.25Z" stroke="currentColor" strokeWidth="1.7"/>
                                        <path d="M4.75 19.25C5.78 16.55 8.37 14.75 11.62 14.75C14.87 14.75 17.46 16.55 18.49 19.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                                        <path d="M18.5 8.5H21M19.75 7.25V9.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                                    </svg>
                                </span>
                                <label htmlFor="selfDescription">Context & Goals</label>
                            </div>

                            <textarea
                                name="selfDescription"
                                id="selfDescription"
                                placeholder="Describe unique career highlights, specific goals, or nuances you want emphasized in this specific interview..."
                            />
                            <p className="panel__tiny-tag">Optional context</p>
                        </article>

                        <button className="button primary-button home__action" type="button">
                            <span>Generate Interview Report</span>
                            <span className="home__action-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        </button>
                    </div>
                </section>

                <footer className="home__statusbar" aria-label="System status">
                    <div className="status-user">
                        <span className="status-user__avatar" aria-hidden="true">A</span>
                        <div>
                            <p>Recruiter Pro</p>
                            <small>AI Analyst</small>
                        </div>
                    </div>

                    <div className="status-metric">
                        <p>System latency</p>
                        <strong>42ms response time</strong>
                    </div>

                    <div className="status-tags">
                        <span>GDPR compliant</span>
                        <span>GPT-4 turbo</span>
                    </div>
                </footer>
            </section>
        </main>
    )
}

export default Home