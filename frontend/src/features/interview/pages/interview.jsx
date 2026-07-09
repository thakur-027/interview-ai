import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'
import Navbar from '../../../components/Navbar.jsx'

const sectionNav = [
  { id: 'technical', label: 'Technical questions' },
  { id: 'behavioral', label: 'Behavioral questions' },
  { id: 'roadmap', label: 'Road Map' },
]

const getMatchTone = (score) => {
  if (score >= 80) return 'Strong match for this role'
  if (score >= 60) return 'Moderate match for this role'
  return 'Low match for this role'
}

const NavIcon = ({ section }) => {
  if (section === 'technical') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 7L4 12L9 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7L20 12L15 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (section === 'behavioral') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 7.75C5 6.78 5.78 6 6.75 6H17.25C18.22 6 19 6.78 19 7.75V14.25C19 15.22 18.22 16 17.25 16H9L5 19V7.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12L19 5L14 19L11 13L5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const Interview = () => {
  const [activeSection, setActiveSection] = useState('roadmap')
  const [openQuestions, setOpenQuestions] = useState({})
  const [isDownloadingResume, setIsDownloadingResume] = useState(false)
  const [downloadError, setDownloadError] = useState(null)
  const { report, loading, getReportById, generateResume } = useInterview()
  const { interviewId } = useParams()

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId)
    }
  }, [interviewId])

  const toggleQuestion = (sectionId, questionIndex) => {
    const key = `${sectionId}-${questionIndex}`
    setOpenQuestions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleGenerateResume = async () => {
    if (!interviewId) return
    setDownloadError(null)
    setIsDownloadingResume(true)
    try {
      await generateResume(interviewId)
    } catch (error) {
      setDownloadError('Failed to download resume. Please try again.')
      console.error('Downloading resume failed:', error)
    } finally {
      setIsDownloadingResume(false)
    }
  }

  return (
    <main className="interview-page">
      <Navbar />
      <div className="interview-page__ambient interview-page__ambient--one" aria-hidden="true" />
      <div className="interview-page__ambient interview-page__ambient--two" aria-hidden="true" />

      {loading ? (
        <div className="interview-loading" aria-busy="true" aria-label="Loading report">
          <div className="interview-loading__spinner" aria-hidden="true" />
          <p>Loading your report…</p>
        </div>
      ) : (
        <section className="interview-layout" aria-label="Interview report layout">
          <aside className="interview-layout__left" aria-label="Section navigation">
            <header className="panel-head">
              <h1>Interview Report</h1>
              <p>Match Score {report?.matchScore ?? 0}%</p>
            </header>

            <nav className="left-nav">
              {sectionNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={activeSection === item.id ? 'active' : ''}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="left-nav__icon" aria-hidden="true">
                    <NavIcon section={item.id} />
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {downloadError && (
              <p className="left-nav__error" role="alert">{downloadError}</p>
            )}

            <button
              type="button"
              className="left-nav__action"
              onClick={handleGenerateResume}
              disabled={!interviewId || isDownloadingResume}
            >
              <span className="left-nav__action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 10C6 7.23858 8.23858 5 11 5H13C15.7614 5 18 7.23858 18 10V14C18 16.7614 15.7614 19 13 19H11C8.23858 19 6 16.7614 6 14V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 8.5H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9.5 12.5H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9.5 16.5H12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <span>{isDownloadingResume ? 'Downloading…' : 'Download Resume'}</span>
            </button>
          </aside>

          <section className="interview-layout__main" aria-label="Interview content">
            {activeSection === 'technical' && (
              <article className="content-group" id="technical-questions">
                <div className="content-group__head">
                  <h2>Technical Questions</h2>
                  <span>{report?.technicalQuestions?.length ?? 0} Items</span>
                </div>
                <div className="question-list">
                  {(report?.technicalQuestions ?? []).map((item, index) => (
                    <article key={item.question} className="question-card">
                      <div className="question-card__head">
                        <div>
                          <p className="question-card__index">Q{index + 1}</p>
                          <h3>{item.question}</h3>
                        </div>
                        <button
                          type="button"
                          className="question-card__toggle"
                          onClick={() => toggleQuestion('technical', index)}
                        >
                          {openQuestions[`technical-${index}`] ? 'Hide details' : 'Show details'}
                        </button>
                      </div>
                      {openQuestions[`technical-${index}`] && (
                        <div className="question-card__details">
                          <p><strong>Intention:</strong> {item.intention}</p>
                          <p><strong>Suggested Answer:</strong> {item.answer}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </article>
            )}

            {activeSection === 'behavioral' && (
              <article className="content-group" id="behavioral-questions">
                <div className="content-group__head">
                  <h2>Behavioral Questions</h2>
                  <span>{report?.behavioralQuestions?.length ?? 0} Items</span>
                </div>
                <div className="question-list">
                  {(report?.behavioralQuestions ?? []).map((item, index) => (
                    <article key={item.question} className="question-card question-card--behavioral">
                      <div className="question-card__head">
                        <div>
                          <p className="question-card__index">B{index + 1}</p>
                          <h3>{item.question}</h3>
                        </div>
                        <button
                          type="button"
                          className="question-card__toggle"
                          onClick={() => toggleQuestion('behavioral', index)}
                        >
                          {openQuestions[`behavioral-${index}`] ? 'Hide details' : 'Show details'}
                        </button>
                      </div>
                      {openQuestions[`behavioral-${index}`] && (
                        <div className="question-card__details">
                          <p><strong>Intention:</strong> {item.intention}</p>
                          <p><strong>Suggested Answer:</strong> {item.answer}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </article>
            )}

            {activeSection === 'roadmap' && (
              <article className="content-group" id="road-map">
                <div className="content-group__head">
                  <h2>Preparation Roadmap</h2>
                  <span>{report?.preparationPlan?.length ?? 0}-day plan</span>
                </div>
                <div className="roadmap-timeline">
                  {(report?.preparationPlan ?? []).map((plan) => (
                    <article key={plan.day} className="timeline-item">
                      <span className="timeline-item__dot" aria-hidden="true" />
                      <div className="timeline-item__content">
                        <header>
                          <p className="roadmap-item__day">Day {plan.day}</p>
                          <h3>{plan.focus}</h3>
                        </header>
                        <ul>
                          {plan.tasks.map((task) => (
                            <li key={task}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            )}
          </section>

          <aside className="interview-layout__right" aria-label="Skill gaps">
            <article className="score-panel" aria-label="Match score">
              <h2>Match Score</h2>
              <div
                className="score-ring"
                style={{ '--score': report?.matchScore ?? 0 }}
              >
                <div className="score-ring__value">
                  <strong>{report?.matchScore ?? 0}</strong>
                  <span>%</span>
                </div>
              </div>
              <p>{getMatchTone(report?.matchScore ?? 0)}</p>
            </article>

            <article className="skill-gaps">
              <h2>Skill Gaps</h2>
              <div className="skill-gaps__list">
                {(report?.skillGaps ?? []).map((item) => (
                  <span key={item.skill} className={`gap gap--${item.severity}`}>
                    {item.skill}
                  </span>
                ))}
              </div>
            </article>
          </aside>
        </section>
      )}

      {isDownloadingResume && (
        <div className="resume-overlay" aria-live="polite" aria-busy="true">
          <div className="resume-overlay__content">
            <div className="resume-overlay__spinner" aria-hidden="true" />
            <p>Generating and downloading your resume…</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default Interview
