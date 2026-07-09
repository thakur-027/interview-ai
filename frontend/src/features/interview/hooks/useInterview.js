import {getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf} from "../services/interview.api"
import {useContext} from "react"
import {InterviewContext} from "../interview.context"

export const useInterview = () => {

    const context = useContext(InterviewContext)

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context

    const generateReport = async ({resumeFile, selfDescription, jobDescription}) => {
        setLoading(true)
        try{
            const response = await generateInterviewReport({resumeFile, selfDescription, jobDescription})
            setReport(response.data.interviewReport)
            return response.data.interviewReport
        } catch (error) {
            console.error("Error generating interview report:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try{
            const response = await getInterviewReportById(interviewId)
            setReport(response.data.interviewReport)
        } catch (error) {
            console.error("Error fetching interview report by ID:", error)
        } finally {
            setLoading(false)
        }
    }

    const getAllReports = async () => {
        setLoading(true)
        try{
            const response = await getAllInterviewReports()
            setReports(response.data.interviewReports)
        } catch (error) {
            console.error("Error fetching interview reports:", error)
        } finally {
            setLoading(false)
        }
    }

    const generateResume = async (interviewReportId) => {
        setLoading(true)
        try{
            const pdfBlob = await generateResumePdf(interviewReportId)
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error generating resume PDF:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return {loading, report, reports, generateReport, getReportById, getAllReports, generateResume}
}