const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

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

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
        },
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
}

module.exports = { generateInterviewReport };