const { GoogleGenAI, Type } = require("@google/genai");
const isProd = process.env.NODE_ENV === "production";
const puppeteer = isProd ? require("puppeteer-core") : require("puppeteer");

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
    // Parse resume content for sections
    const resumeLines = (resume || '').split(/\r?\n/).filter(line => line.trim());
    
    // Extract basic info (very naive extraction)
    const nameMatch = resumeLines[0] || 'Candidate Name';
    const emailMatch = resume.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || ['candidate@email.com'];
    const phoneMatch = resume.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/) || ['+1-xxx-xxx-xxxx'];
    
    // Extract skills from resume or job description
    const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'SQL'];
    const foundSkills = skillKeywords.filter(skill => {
        const text = `${resume} ${jobDescription} ${selfDescription}`.toLowerCase();
        return text.includes(skill.toLowerCase());
    });
    const languages = foundSkills.slice(0, 5).join(', ') || 'Programming Languages';
    const frameworks = 'Web Frameworks, Cloud Services';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: #fff;
            padding: 28px 32px;
            max-width: 760px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 18px;
            padding-bottom: 8px;
            border-bottom: 1.5px solid #000;
        }
        .header-left {
            flex: 1;
        }
        .header-right {
            text-align: right;
            font-size: 10px;
            line-height: 1.5;
        }
        .name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .degree {
            font-size: 11px;
            margin-bottom: 1px;
        }
        .institution {
            font-size: 11px;
            font-style: italic;
        }
        .contact-line {
            margin-bottom: 2px;
        }
        .section {
            margin-bottom: 14px;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            font-variant: small-caps;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid #000;
            padding-bottom: 2px;
            margin-bottom: 8px;
        }
        .subsection {
            margin-bottom: 10px;
        }
        .subsection-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }
        .subsection-title {
            font-weight: bold;
        }
        .subsection-org {
            font-style: italic;
        }
        .subsection-date {
            font-style: italic;
            font-size: 10px;
        }
        .project-desc {
            font-style: italic;
            font-size: 11px;
            margin-bottom: 3px;
        }
        ul {
            margin: 0;
            padding-left: 18px;
            list-style: none;
        }
        li {
            margin-bottom: 3px;
            position: relative;
        }
        li::before {
            content: '–';
            position: absolute;
            left: -12px;
        }
        .skills-line {
            margin-bottom: 6px;
        }
        .skills-line strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="name">${escapeHtml(nameMatch)}</div>
            <div class="degree">Bachelor of Technology in Computer Science</div>
            <div class="institution">University Name</div>
        </div>
        <div class="header-right">
            <div class="contact-line">${escapeHtml(phoneMatch[0])}</div>
            <div class="contact-line">${escapeHtml(emailMatch[0])}</div>
            <div class="contact-line">GitHub Profile</div>
            <div class="contact-line">LinkedIn Profile</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        <div class="subsection">
            <div class="subsection-header">
                <div>
                    <span class="subsection-title">Bachelor of Technology in Computer Science</span>
                </div>
                <div class="subsection-date">2020-24</div>
            </div>
            <div class="subsection-org">University Name</div>
            <div>CGPA: --</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Personal Projects</div>
        <div class="subsection">
            <div class="subsection-title">• Project Title</div>
            <div class="project-desc">A brief description of the project demonstrating technical skills.</div>
            <ul>
                <li>Implemented key feature resulting in measurable impact</li>
                <li>Used modern architecture and best practices</li>
                <li>Technology Used: ${escapeHtml(languages)}</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Experience</div>
        <div class="subsection">
            <div class="subsection-header">
                <div>
                    <span class="subsection-title">• Internship or Role Title</span>
                </div>
                <div class="subsection-date">Month Year - Month Year</div>
            </div>
            <div class="subsection-org">Company Name</div>
            <ul>
                <li>Achieved measurable outcome through specific technical contribution</li>
                <li>Collaborated with team on architecture and implementation</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Technical Skills and Interests</div>
        <div class="skills-line"><strong>Languages:</strong> ${escapeHtml(languages)}</div>
        <div class="skills-line"><strong>Frameworks:</strong> ${escapeHtml(frameworks)}</div>
        <div class="skills-line"><strong>Tools:</strong> Git, Docker, VS Code</div>
        <div class="skills-line"><strong>Databases:</strong> MongoDB, PostgreSQL</div>
        <div class="skills-line"><strong>Areas of Interest:</strong> Web Development, Cloud Computing</div>
    </div>

    <div class="section">
        <div class="section-title">Positions of Responsibility</div>
        <div class="subsection">
            <div class="subsection-header">
                <div>
                    <span class="subsection-title">• Volunteer Role</span>
                    <span> Event Name - Organization</span>
                </div>
                <div class="subsection-date">Month Year</div>
            </div>
            <ul>
                <li>Contributed to organizing and executing event activities</li>
                <li>Engaged with attendees and facilitated smooth operations</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
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
        const launchOptions = {
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--font-render-hinting=none",
                "--enable-font-antialiasing",
            ],
        }

        if (isProd) {
            const chromium = (await import("@sparticuz/chromium")).default
            launchOptions.args = chromium.args
            launchOptions.executablePath = await chromium.executablePath()
        }

        browser = await puppeteer.launch(launchOptions)

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
            margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
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
                description: "The complete HTML document for the resume",
            },
        },
        required: ["html"],
    }

    const prompt = `You are an expert resume writer. Generate a clean, ATS-optimized resume in HTML format based on the candidate information below.

CANDIDATE RESUME TEXT:
${resume}

CANDIDATE SELF-DESCRIPTION / GOALS:
${selfDescription || 'Not provided'}

TARGET JOB DESCRIPTION:
${jobDescription}

STRICT FORMAT REQUIREMENTS — follow exactly:

1. PAGE LAYOUT
   - White background, black text only — NO colors, NO colored boxes, NO background shading
   - Font: "Times New Roman", serif — exactly as a traditional academic/professional resume
   - Page width: 100%, max-width 760px, margin: 0 auto, padding: 28px 32px
   - Font size: 11px body, 20px name, 13px section headings
   - Single page only — keep content concise

2. HEADER (two-column layout, side by side)
   - LEFT column: Candidate full name (large, bold), then degree on next line, then college/institution
   - RIGHT column (text-align: right): phone, email, GitHub link, LinkedIn link — each on its own line
   - A thin horizontal rule below the header

3. SECTION HEADINGS
   - ALL CAPS, font-variant: small-caps, bold
   - Underlined with a full-width bottom border (border-bottom: 1.5px solid black)
   - Sections in this order: Education, Personal Projects (or Experience Projects), Experience, Technical Skills and Interests, Positions of Responsibility (if any)

4. EDUCATION SECTION
   - Degree title in bold, institution in italic, date range right-aligned
   - CGPA or grade on a new line

5. PROJECTS SECTION
   - Project name in bold preceded by a bullet •
   - One-line italic description of the project
   - Bullet points using em-dash (–) for each key point
   - "Technology Used: ..." as the last bullet for each project

6. EXPERIENCE SECTION
   - Role/internship title in bold preceded by •, company in italic, date range right-aligned
   - Bullet points using (–) for responsibilities

7. SKILLS SECTION
   - Inline format: "Languages: ...", "Frameworks: ...", "Tools: ...", "Databases: ...", "Coursework: ..."
   - Each category label in bold, values in normal weight, all on one line per category

8. ATS REQUIREMENTS
   - Use plain text only inside tags — no SVG icons, no images, no tables for layout
   - Use standard HTML: div, p, ul, li, span, hr, br
   - All section names must be exact keywords (Education, Experience, Skills, Projects)
   - Do NOT use CSS grid or flexbox for the skills section — use plain inline text
   - Keyword-match skills and tools from the job description naturally in bullet points

9. CONTENT RULES
   - Extract real data from the resume text provided — do not invent details
   - Tailor bullet points to emphasize skills relevant to the job description
   - Keep language concise, action-verb led, quantified where possible
   - Do NOT add a photo, objective statement, or summary paragraph
   - Do NOT add fake contact info — use placeholders like [email] only if not present in resume

Return a single complete HTML document with all CSS inlined in a <style> tag in <head>.`;

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