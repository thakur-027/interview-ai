const test = require('node:test');
const assert = require('node:assert/strict');

const { buildInterviewReportFallback } = require('../src/services/ai.service');

test('buildInterviewReportFallback creates a structured interview report', () => {
  const report = buildInterviewReportFallback({
    resume: 'Built Node.js APIs and React dashboards for a SaaS product.',
    selfDescription: 'I am a full stack engineer focused on scalable backend systems.',
    jobDescription: 'Senior Full Stack Engineer with Node.js, React, AWS, and mentoring experience.',
  });

  assert.equal(typeof report.matchScore, 'number');
  assert.ok(report.matchScore >= 0 && report.matchScore <= 100);
  assert.ok(Array.isArray(report.technicalQuestions));
  assert.ok(report.technicalQuestions.length > 0);
  assert.ok(Array.isArray(report.behavioralQuestions));
  assert.ok(report.behavioralQuestions.length > 0);
  assert.ok(Array.isArray(report.skillGaps));
  assert.ok(Array.isArray(report.preparationPlan));
  assert.ok(report.preparationPlan.length > 0);
});
