import React, { useState } from 'react'
import '../style/interview.scss'

const reportData = {
  matchScore: 92,
  technicalQuestions: [
    {
      question: 'How did you ensure atomicity in your Bank Transaction System using MongoDB sessions, and why was it necessary to use a double-entry ledger architecture?',
      intention: 'To evaluate the candidate\'s understanding of database consistency, transactional integrity, and financial system design patterns.',
      answer: 'Explain that atomicity ensures that either all operations in a transaction (debit from sender, credit to receiver, and status update) succeed, or none do, preventing data corruption.',
    },
    {
      question: 'In your Blog App, you used Coroutines for asynchronous data fetching. Explain how Coroutines handle thread management compared to traditional callbacks.',
      intention: 'To assess proficiency in modern Android concurrency patterns and memory management.',
      answer: 'Discuss how Coroutines use suspend functions to pause execution without blocking the main thread, leading to cleaner code and safer lifecycle-aware cancellation.',
    },
    {
      question: 'Your MealMind project uses LightGBM for ranking. How did you integrate the model and still keep latency under 300ms?',
      intention: 'To understand the candidate\'s ability to optimize performance when integrating AI/ML models into software products.',
      answer: 'Focus on two-stage retrieval: quickly narrow candidates first, then run expensive ranking on a small subset with pre-computed features.',
    },
  ],
  behavioralQuestions: [
    {
      question: 'During your internship, you found a critical security vulnerability. How did you communicate this and ensure it was fixed?',
      intention: 'To assess communication skills, proactive problem-solving, and attention to detail.',
      answer: 'Use STAR: define the risk clearly, document reproducible steps, align with stakeholders, and follow through to verify resolution.',
    },
    {
      question: 'Tell me about a time you had to learn a new technology quickly to meet a project deadline. How did you approach it?',
      intention: 'To evaluate adaptability and self-learning capabilities.',
      answer: 'Describe a focused learning loop: docs, small prototype, then progressive integration with frequent validation.',
    },
  ],
  skillGaps: [
    {
      skill: 'Version Control (Git) Workflows',
      severity: 'low',
    },
    {
      skill: 'Unit Testing & UI Testing (JUnit, Espresso)',
      severity: 'medium',
    },
    {
      skill: 'Java (Primary focus is Kotlin)',
      severity: 'low',
    },
    {
      skill: 'CI/CD Pipelines',
      severity: 'medium',
    },
  ],
  preparationPlan: [
    {
      day: 1,
      focus: 'Data Structures and Algorithms (DSA) in C++',
      tasks: [
        'Review common data structures and complexity trade-offs.',
        'Practice medium coding problems on hash maps and strings.',
        'Refresh core OOP concepts with short examples.',
      ],
    },
    {
      day: 2,
      focus: 'Android Development Deep Dive',
      tasks: [
        'Review Jetpack Compose state management patterns.',
        'Study lifecycle components and ViewModel coordination.',
        'Refresh Java syntax for legacy compatibility.',
      ],
    },
    {
      day: 3,
      focus: 'Backend Architecture & Security',
      tasks: [
        'Design mock REST endpoints and data contracts.',
        'Review aggregation pipelines and indexing strategy.',
        'Revisit OAuth2 and JWT best practices.',
      ],
    },
    {
      day: 4,
      focus: 'System Design and Version Control',
      tasks: [
        'Learn practical Git branching strategies.',
        'Study caching, scaling, and sharding fundamentals.',
        'Draw architecture diagrams for key projects.',
      ],
    },
    {
      day: 5,
      focus: 'Mock Interviews & Behavioral Prep',
      tasks: [
        'Practice STAR responses for project narratives.',
        'Prepare interviewer-focused reverse questions.',
        'Run a mock session and review clarity of explanations.',
      ],
    },
  ],
}

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

  const toggleQuestion = (sectionId, questionIndex) => {
    const key = `${sectionId}-${questionIndex}`
    setOpenQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <main className="interview-page">
      <div className="interview-page__ambient interview-page__ambient--one" aria-hidden="true" />
      <div className="interview-page__ambient interview-page__ambient--two" aria-hidden="true" />

      <section className="interview-layout" aria-label="Interview report layout">
        <aside className="interview-layout__left" aria-label="Section navigation">
          <header className="panel-head">
            <h1>Interview Report</h1>
            <p>Match Score {reportData.matchScore}%</p>
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
        </aside>

        <section className="interview-layout__main" aria-label="Interview content">
          {activeSection === 'technical' && (
            <article className="content-group" id="technical-questions">
            <div className="content-group__head">
              <h2>Technical Questions</h2>
              <span>{reportData.technicalQuestions.length} Items</span>
            </div>

            <div className="question-list">
              {reportData.technicalQuestions.map((item, index) => (
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
                      <p>
                        <strong>Intention:</strong> {item.intention}
                      </p>
                      <p>
                        <strong>Suggested Answer:</strong> {item.answer}
                      </p>
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
              <span>{reportData.behavioralQuestions.length} Items</span>
            </div>

            <div className="question-list">
              {reportData.behavioralQuestions.map((item, index) => (
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
                      <p>
                        <strong>Intention:</strong> {item.intention}
                      </p>
                      <p>
                        <strong>Suggested Answer:</strong> {item.answer}
                      </p>
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
              <h2>5-Day Preparation Roadmap</h2>
              <span>{reportData.preparationPlan.length}-day plan</span>
            </div>

            <div className="roadmap-timeline">
              {reportData.preparationPlan.map((plan) => (
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
              style={{ '--score': reportData.matchScore }}
            >
              <div className="score-ring__value">
                <strong>{reportData.matchScore}</strong>
                <span>%</span>
              </div>
            </div>
            <p>{getMatchTone(reportData.matchScore)}</p>
          </article>

          <article className="skill-gaps">
            <h2>Skill Gaps</h2>
            <div className="skill-gaps__list">
              {reportData.skillGaps.map((item) => (
                <span key={item.skill} className={`gap gap--${item.severity}`}>
                  {item.skill}
                </span>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  )
}

export default Interview