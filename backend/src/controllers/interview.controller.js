const { PDFParse } = require('pdf-parse')
const {generateInterviewReport, generateResumePdf} = require('../services/ai.service')
const interviewReportModel = require('../models/interviewReport.model')

const getErrorStatus = (error) =>
    error?.statusCode ?? error?.code ?? error?.status ?? error?.error?.code ?? error?.error?.status ?? error?.response?.status

const getErrorStatusText = (error) =>
    error?.statusText ?? error?.status ?? error?.error?.status ?? error?.response?.statusText

const getErrorMessage = (error) =>
    String(error?.message ?? error?.error?.message ?? error?.response?.data?.message ?? '')

const sendAiError = (res, error, fallbackMessage) => {
    const statusCode = getErrorStatus(error)
    const statusText = getErrorStatusText(error)
    const message = getErrorMessage(error)
    const isUnavailable = [503, 429].includes(statusCode) || statusText === 'UNAVAILABLE' || statusText === 'RESOURCE_EXHAUSTED' || /high demand|quota|rate limit/i.test(message)

    return res.status(isUnavailable ? 503 : 500).json({
        message: isUnavailable
            ? 'AI service is temporarily unavailable. Please try again in a moment.'
            : fallbackMessage,
    })
}


/**
 *@description Controller to generate interview report based on user self description, resume, and job description
 */
async function generateInterviewReportController(req, res){
    try {
        const resumeContent = await new PDFParse({ data: req.file.buffer }).getText()
        const { selfDescription, jobDescription } = req.body
        const title = jobDescription
            ?.split('\n')
            .find((line) => line.trim())
            ?.trim()
            .slice(0, 120) || 'Interview Report'

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            title,
            ...interviewReportByAi
        })
        res.status(201).json({
            message: 'Interview report generated successfully',
            interviewReport
        })
    } catch (error) {
        console.error('Error generating interview report:', error)
        return sendAiError(res, error, 'Failed to generate interview report')
    }
}

/**
 * @description Controller to get interview report by ID
 */
async function getInterviewReportByIdController(req, res){
    const { interviewId } = req.params
    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
    if (!interviewReport) {
        return res.status(404).json({ message: 'Interview report not found' })
    }
    res.status(200).json({ 
        message: 'Interview report found',
        interviewReport
    })
}

/**
 * @description Controller to get all interview reports of the user
 */
async function getAllInterviewReportsController(req, res){
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select('-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan')
    res.status(200).json({ 
        message: 'Interview reports found',
        interviewReports
    })
}

/**
 * @description Controller to generate resume PDF based on user self description, resume, and job description
 */
async function generateResumePdfController(req, res){
    try {
        const {interviewReportId} = req.params
        const interviewReport = await interviewReportModel.findById(interviewReportId)
        if(!interviewReport){
            return res.status(404).json({ message: 'Interview report not found' })
        }
        const { resume, selfDescription, jobDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, selfDescription, jobDescription })
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
        })
        res.send(pdfBuffer)
    } catch (error) {
        console.error('Error generating resume PDF:', error)
        return sendAiError(res, error, 'Failed to generate resume PDF')
    }
}


module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController };