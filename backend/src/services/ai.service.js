const { GoogleGenAI, Type } = require("@google/genai");

const isProd = process.env.NODE_ENV === "production";
const puppeteer = isProd ? require("puppeteer-core") : require("puppeteer");
const chromium = isProd ? require("@sparticuz/chromium") : null;

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const geminiModels = [
    process.env.GEMINI_MODEL || "gemini-3-flash-preview",
    "gemini-2.0-flash",
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_MODEL_ATTEMPTS_PER_MODEL = 2
const MAX_RETRY_DELAY_MS = 15000

const getErrorStatus = (error) =>
    error?.statusCode ?? error?.code ?? error?.status ?? error?.error?.code ?? error?.error?.status ?? error?.response?.status

const getErrorStatusText = (error) =>
    error?.statusText ?? error?.status ?? error?.error?.status ?? error?.response?.statusText

const getErrorMessage = (error) =>
    String(error?.message ?? error?.error?.message ?? error?.response?.data?.message ?? "")

const getRetryDelayFromError = (error) => {
    const details = error?.details ?? error?.error?.details ?? error?.response?.data?.error?.details
    if (Array.isArray(details)) {
        const retryInfo = details.find(
            (detail) => String(detail?.['@type'] ?? '').includes('RetryInfo')
        )
        if (retryInfo?.retryDelay) {
            const seconds = Number(retryInfo.retryDelay.seconds ?? 0)
            const nanos = Number(retryInfo.retryDelay.nanos ?? 0)
            return seconds * 1000 + nanos / 1e6
        }
    }

    const message = getErrorMessage(error)
    const match = message.match(/retry(?: in)?\s*([0-9]+(?:\.[0-9]+)?)s/i)
    if (match) {
        return Number(match[1]) * 1000
    }

    return null
}

const isTransientGeminiError = (error) => {
    const statusCode = getErrorStatus(error)
    const statusText = getErrorStatusText(error)
    const message = getErrorMessage(error)

    return (
        statusCode === 503 ||
        statusCode === 429 ||
        statusText === "UNAVAILABLE" ||
        statusText === "RESOURCE_EXHAUSTED" ||
        /high demand/i.test(message) ||
        /quota/i.test(message) ||
        /rate limit/i.test(message)
    )
};

const isQuotaExceededError = (error) => {
    const statusCode = getErrorStatus(error)
    const statusText = getErrorStatusText(error)
    const message = getErrorMessage(error)

    return (
        statusCode === 429 &&
        (statusText === "RESOURCE_EXHAUSTED" || /quota exceeded/i.test(message))
    )
}

async function generateContentWithFallback({ contents, responseSchema }) {
    let lastError;

    for (let index = 0; index < geminiModels.length; index += 1) {
        const model = geminiModels[index];
        let attempt = 0;

        while (attempt < MAX_MODEL_ATTEMPTS_PER_MODEL) {
            attempt += 1;
            try {
                return await ai.models.generateContent({
                    model,
                    contents,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema,
                    },
                });
            } catch (error) {
                lastError = error;

                if (!isTransientGeminiError(error)) {
                    throw error;
                }

                const retryDelay = getRetryDelayFromError(error)
                if (isQuotaExceededError(error)) {
                    if (retryDelay === null || retryDelay > MAX_RETRY_DELAY_MS) {
                        console.warn(`Gemini quota exhausted for ${model}; failing fast without waiting ${retryDelay ?? 'unknown'}ms.`)
                        break
                    }
                }

                const waitMs = retryDelay !== null ? Math.min(retryDelay, MAX_RETRY_DELAY_MS) : 750 * attempt
                if (attempt < MAX_MODEL_ATTEMPTS_PER_MODEL) {
                    console.warn(
                        `Gemini model ${model} transient error, retrying after ${waitMs}ms: ${getErrorMessage(error)}`
                    )
                    await wait(waitMs)
                    continue
                }

                break
            }
        }

        if (index < geminiModels.length - 1) {
            const nextModel = geminiModels[index + 1]
            console.warn(`Gemini model ${model} failed, falling back to ${nextModel}`)
            await wait(500)
        }
    }

    throw lastError;
}

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const toBulletItems = (text = "", limit = 8) =>
    text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, limit);

function buildInterviewReportFallback({ resume = "", selfDescription = "", jobDescription = "" }) {
    const resumeText = resume || selfDescription || jobDescription || "No resume details provided.";
    const jobKeywords = (jobDescription || "")
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .slice(0, 10);

    const skillMatches = [
        "Node.js",
        "React",
        "MongoDB",
        "REST APIs",
        "System design",
        "Testing",
        "AWS",
        "TypeScript",
    ].filter((skill) => {
        const haystack = `${resumeText} ${jobDescription} ${selfDescription}`.toLowerCase();
        return haystack.includes(skill.toLowerCase());
    });

    const inferredSkills = skillMatches.length > 0 ? skillMatches : ["Software engineering", "Problem solving"];
    const matchScore = Math.min(95, Math.max(45, 70 + inferredSkills.length * 3));

    return {
        matchScore,
        technicalQuestions: [
            {
                question: "Describe a project where you improved performance or reliability.",
                intention: "Assess system design and engineering judgment.",
                answer: "Explain the problem, the trade-offs you evaluated, the implementation details, and the measurable impact.",
            },
            {
                question: "How would you structure a scalable backend service for a growing product?",
                intention: "Evaluate architecture, API design, and scalability thinking.",
                answer: "Discuss boundaries, data modeling, observability, caching, and deployment considerations.",
            },
        ],
        behavioralQuestions: [
            {
                question: "Tell me about a time you handled a disagreement with a teammate.",
                intention: "Understand collaboration and communication style.",
                answer: "Use the STAR format and focus on what you learned and how you aligned the team.",
            },
            {
                question: "Describe a time you had to learn a new technology quickly.",
                intention: "Judge adaptability and initiative.",
                answer: "Describe the context, the learning approach, and the outcome of the work.",
            },
        ],
        skillGaps: inferredSkills.slice(0, 3).map((skill, index) => ({
            skill,
            severity: index === 0 ? "medium" : "low",
        })),
        preparationPlan: [
            {
                day: 1,
                focus: "Review the core requirements and align your experience to the role",
                tasks: [
                    "Map your experience to the job description",
                    "Prepare 3 examples of relevant projects",
                ],
            },
            {
                day: 2,
                focus: "Strengthen technical storytelling and hands-on examples",
                tasks: [
                    "Practice explaining architecture decisions",
                    "Prepare answers for common system design questions",
                ],
            },
        ],
    };
}

function buildResumeHtmlFallback({ resume, selfDescription, jobDescription }) {
    const skills = toBulletItems(jobDescription || selfDescription || resume, 8);
    const experience = toBulletItems(resume, 10);
    const summaryText = selfDescription || 'Experienced professional with strong technical and problem-solving skills.';
    const roleText = jobDescription || 'Professional Resume';

    return `
        <html>
            <head>
                <meta charset="utf-8" />
                <style>
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, Helvetica, sans-serif;
                        color: #1f2937;
                        background: #f5f7fa;
                    }
                    .page {
                        width: 100%;
                        max-width: 850px;
                        margin: 0 auto;
                        background: #ffffff;
                        color: #1f2937;
                        padding: 24px 28px;
                    }
                    .header {
                        border-bottom: 2px solid #1f4e79;
                        padding-bottom: 10px;
                        margin-bottom: 14px;
                    }
                    h1 {
                        margin: 0 0 6px;
                        font-size: 24px;
                        color: #0f172a;
                    }
                    .subtitle {
                        margin: 0;
                        font-size: 11px;
                        color: #4b5563;
                        line-height: 1.5;
                    }
                    .section {
                        margin-bottom: 12px;
                        padding-top: 8px;
                    }
                    .section h2 {
                        margin: 0 0 6px;
                        font-size: 13px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 0.04em;
                        color: #1f4e79;
                        border-bottom: 1px solid #dbe4ee;
                        padding-bottom: 4px;
                    }
                    .content {
                        font-size: 11px;
                        line-height: 1.45;
                        color: #374151;
                    }
                    ul {
                        margin: 4px 0 0 0;
                        padding-left: 16px;
                    }
                    li {
                        margin-bottom: 3px;
                    }
                    .two-col {
                        display: grid;
                        grid-template-columns: 1.15fr 0.85fr;
                        gap: 14px;
                        align-items: start;
                    }
                    .muted { color: #4b5563; }
                    .tag {
                        display: inline-block;
                        background: #eef4fb;
                        color: #1f4e79;
                        padding: 3px 7px;
                        border-radius: 999px;
                        margin: 2px 6px 2px 0;
                        font-size: 10px;
                    }
                    .compact {
                        margin: 0;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        font-family: inherit;
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <h1>Candidate Resume</h1>
                        <p class="subtitle">${escapeHtml(roleText)}</p>
                    </div>

                    <div class="section">
                        <h2>Professional Summary</h2>
                        <div class="content">${escapeHtml(summaryText)}</div>
                    </div>

                    <div class="two-col">
                        <div class="section">
                            <h2>Core Skills</h2>
                            <div class="content">
                                ${skills.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}
                            </div>
                        </div>
                        <div class="section">
                            <h2>Experience Highlights</h2>
                            <div class="content">
                                <ul>
                                    ${experience.map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li class="muted">No experience details extracted</li>'}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>Resume Details</h2>
                        <div class="content compact">${escapeHtml(resume)}</div>
                    </div>
                </div>
            </body>
        </html>
    `;
}

// Built natively for Gemini — no zod-to-json-schema involved.
// This avoids unsupported keywords ($ref, definitions, additionalProperties)
// that Gemini silently ignores, causing it to fall back to free-form output.
const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.NUMBER,
            description: "The match score between the candidate's resume and the job description, ranging from 0 to 100",
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "A list of technical questions, their intentions, and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question asked during the interview" },
                    intention: { type: Type.STRING, description: "The intention of interviewer behind the technical question" },
                    answer: { type: Type.STRING, description: "How to answer the technical question, what points to cover, what to avoid, and how to structure the answer" },
                },
                required: ["question", "intention", "answer"],
            },
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            description: "A list of behavioral questions, their intentions, and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The behavioral question asked during the interview" },
                    intention: { type: Type.STRING, description: "The intention of interviewer behind the behavioral question" },
                    answer: { type: Type.STRING, description: "How to answer the behavioral question, what points to cover, what to avoid, and how to structure the answer" },
                },
                required: ["question", "intention", "answer"],
            },
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "A list of skill gaps and their severity",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The skill that the candidate lacks" },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"], description: "The severity of the skill gap" },
                },
                required: ["skill", "severity"],
            },
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "A list of preparation plans for the candidate to follow, with day-wise focus and tasks",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER, description: "The day of the preparation plan. Starting from day 1" },
                    focus: { type: Type.STRING, description: "The focus of the preparation plan for that day" },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of tasks to be completed on this day to follow the preparation plan",
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"],
    title: "Interview Report",
};

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate based on the following information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

The interview report should include the following:
1. Match Score: A score between 0 and 100 indicating how well the candidate's resume matches the job description.
2. Technical Questions: A list of technical questions that may be asked during the interview, along with the intention behind each question and how to answer them.
3. Behavioral Questions: A list of behavioral questions that may be asked during the interview, along with the intention behind each question and how to answer them.
4. Skill Gaps: A list of skills that the candidate lacks, along with the severity of each skill gap (low, medium, high).
5. Preparation Plan: A day-wise preparation plan for the candidate to follow, with a focus for each day and a list of tasks to be completed.`;

    try {
        const response = await generateContentWithFallback({
            contents: prompt,
            responseSchema: interviewReportSchema,
        });

        let parsed;
        try {
            parsed = JSON.parse(response.text);
        } catch (err) {
            console.error("Failed to parse Gemini response as JSON:", response.text);
            throw new Error("AI returned invalid JSON");
        }

        if (parsed.matchScore === undefined || !parsed.technicalQuestions?.length) {
            console.warn("Gemini response missing expected fields:", parsed);
        }

        return parsed;
    } catch (error) {
        console.warn("Falling back to local interview report generation:", error?.message ?? error);
        return buildInterviewReportFallback({ resume, selfDescription, jobDescription });
    }
}

async function generatePdfFromHtml(htmlContent) {
    let browser

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: isProd
                ? chromium.args
                : [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--font-render-hinting=none",
                    "--enable-font-antialiasing",
                  ],
            executablePath: isProd ? await chromium.executablePath() : undefined,
        })

        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(45000)
        await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 })
        await page.evaluate(async () => {
            await document.fonts.ready
        })
        await page.emulateMediaType('screen')

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
        })

        return pdfBuffer
    } finally {
        if (browser) {
            await browser.close().catch(() => {})
        }
    }
}

async function generateResumePdf({resume, selfDescription, jobDescription}) {

    const resumePdfSchema = {
        type: Type.OBJECT,
        properties: {
            html: {
                type: Type.STRING,
                description: "The HTML content of the resume PDF",
            },
        },
        required: ["html"],
    }

    const prompt = `Generate a resume for a candidate based on the following information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
The resume should be in HTML format and should include the following sections:
1. Header: The candidate's name, contact information, and a professional summary.
2. Skills: A list of the candidate's skills relevant to the job description.
3. Experience: A list of the candidate's work experience, including job titles, company names, and dates of employment.
4. Education: A list of the candidate's educational qualifications, including degrees and institutions.
5. Projects: A list of the candidate's relevant projects, including project titles and descriptions.
6. Certifications: A list of the candidate's relevant certifications, if any.
the resume should be tailored to the job description and should highlight the candidate's strengths and achievements.
the content of resume should not sound like its generated by AI. It should be human-like and professional.
highlight the content using some colors or different font styles to make it visually appealing. The resume should be in a single page and should be easy to read. The resume should be in a format that can be easily converted to PDF.
the content should be ATS friendly, which will be easily parsable through ATS checker maintaining atleast 90+ ats score.
`;

    try {
        const response = await generateContentWithFallback({
            contents: prompt,
            responseSchema: resumePdfSchema,
        })

        const jsonContent = JSON.parse(response.text)
        if (!jsonContent?.html) {
            throw new Error('AI returned empty resume HTML')
        }

        return await generatePdfFromHtml(jsonContent.html)
    } catch (error) {
        console.warn('Falling back to local resume PDF generation:', error?.message ?? error)
        const fallbackHtml = buildResumeHtmlFallback({ resume, selfDescription, jobDescription })
        return await generatePdfFromHtml(fallbackHtml)
    }

}

module.exports = { generateInterviewReport, generateResumePdf, buildInterviewReportFallback };